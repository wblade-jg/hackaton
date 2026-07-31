using System.Text.Json;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace FinancialEngine.McpServer;

class Program
{
    // stderr reservado para logs de diagnóstico. stdout queda 100% libre para el canal JSON-RPC.
    private static readonly TextWriter Logger = Console.Error;

    static async Task Main(string[] args)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;

        // 1. Configuración del Host e Inyección de Dependencias
        var host = Host.CreateDefaultBuilder(args)
            .ConfigureServices((hostContext, services) =>
            {
                string connectionString = hostContext.Configuration["ConnectionStrings:DefaultConnection"]
                    ?? "Server=localhost;Port=3306;Database=financial_db;Uid=root;Pwd=root;";

                services.AddDbContext<AppDbContext>(options =>
                    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
            })
            .Build();

        Logger.WriteLine("[MCP SERVER] FinancialEngine.McpServer iniciado con conexión real a MySQL (EF Core).");

        // 2. Loop de Lectura de Transporte STDIO (JSON-RPC)
        using var scope = host.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        while (true)
        {
            string? line = await Console.In.ReadLineAsync();
            if (line == null) break;

            if (string.IsNullOrWhiteSpace(line)) continue;

            try
            {
                using var doc = JsonDocument.Parse(line);
                var root = doc.RootElement;

                if (!root.TryGetProperty("method", out var methodProp)) continue;
                string method = methodProp.GetString() ?? "";

                long? id = root.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.Number
                    ? idProp.GetInt64()
                    : null;

                Logger.WriteLine($"[MCP SERVER LOG] Método recibido: '{method}' (ID: {id})");

                switch (method)
                {
                    case "initialize":
                        SendResponse(id, new
                        {
                            protocolVersion = "2024-11-05",
                            capabilities = new { tools = new { } },
                            serverInfo = new { name = "FinancialEngine.McpServer", version = "2.0.0" }
                        });
                        break;

                    case "notifications/initialized":
                        Logger.WriteLine("[MCP SERVER LOG] Handshake completado con éxito por el Agente.");
                        break;

                    case "tools/list":
                        SendResponse(id, new { tools = ObtenerHerramientasDisponibles() });
                        break;

                    case "tools/call":
                        if (root.TryGetProperty("params", out var paramsProp))
                        {
                            string toolName = paramsProp.GetProperty("name").GetString() ?? "";
                            var toolArguments = paramsProp.TryGetProperty("arguments", out var argsProp) ? argsProp : default;

                            string resultadoJson = await EjecutarHerramientaAsync(dbContext, toolName, toolArguments);

                            SendResponse(id, new
                            {
                                content = new[] { new { type = "text", text = resultadoJson } },
                                isError = false
                            });
                        }
                        break;

                    default:
                        if (id.HasValue)
                            SendError(id.Value, -32601, $"El método '{method}' no está implementado.");
                        break;
                }
            }
            catch (Exception ex)
            {
                Logger.WriteLine($"[MCP SERVER ERROR] Excepción al procesar línea: {ex.Message}");
            }
        }
    }

    private static object[] ObtenerHerramientasDisponibles()
    {
        return new object[]
        {
            new
            {
                name = "obtener_resumen_archivos",
                description = "Obtiene el resumen de control de todos los lotes de archivos procesados desde la base de datos MySQL real.",
                inputSchema = new
                {
                    type = "object",
                    properties = new
                    {
                        estado = new { type = "string", description = "Filtro opcional por estado: 'PROCESADO', 'CON_ERRORES' o 'FALLIDO'." }
                    }
                }
            },
            new
            {
                name = "analizar_transacciones_rechazadas",
                description = "Consulta la base de datos MySQL y lista las transacciones con estado RECHAZADA, con sus motivos.",
                inputSchema = new
                {
                    type = "object",
                    properties = new
                    {
                        archivo_id = new { type = "integer", description = "ID opcional del lote de archivo (ArchivoControl.Id) a auditar." },
                        motivo = new { type = "string", description = "Filtro de búsqueda por palabra clave dentro del MotivoRechazo." }
                    }
                }
            },
            new
            {
                name = "corregir_transaccion",
                description = "Corrige el monto de una transacción RECHAZADA en MySQL y la aprueba si el nuevo monto es válido.",
                inputSchema = new
                {
                    type = "object",
                    properties = new
                    {
                        transaccion_id = new { type = "integer", description = "ID de la transacción (Transaccion.Id) a corregir." },
                        nuevo_monto = new { type = "number", description = "Nuevo monto corregido (debe ser positivo)." }
                    },
                    required = new[] { "transaccion_id", "nuevo_monto" }
                }
            }
        };
    }

    private static async Task<string> EjecutarHerramientaAsync(AppDbContext dbContext, string nombre, JsonElement argumentos)
    {
        Logger.WriteLine($"[MCP SERVER LOG] Ejecutando consulta real en MySQL para '{nombre}'...");
        var jsonOptions = new JsonSerializerOptions { WriteIndented = true };

        switch (nombre)
        {
            case "obtener_resumen_archivos":
            {
                string? estadoFiltro = argumentos.TryGetProperty("estado", out var estadoProp)
                    ? estadoProp.GetString()
                    : null;

                // Parsear filtro de estado como enum si se provee
                ArchivoEstado? estadoEnum = null;
                if (!string.IsNullOrWhiteSpace(estadoFiltro) && Enum.TryParse<ArchivoEstado>(estadoFiltro, true, out var parsed))
                    estadoEnum = parsed;

                var query = dbContext.ArchivosProcesados.AsNoTracking();

                if (estadoEnum.HasValue)
                    query = query.Where(a => a.Estado == estadoEnum.Value);

                var lista = await query
                    .OrderByDescending(a => a.FechaProceso)
                    .Select(a => new
                    {
                        a.Id,
                        Archivo = a.NombreArchivo,
                        Estado = a.Estado.ToString(),
                        a.TotalRegistros,
                        a.Procesados,
                        a.Rechazados,
                        FechaProcesamiento = a.FechaProceso
                    })
                    .ToListAsync();

                return JsonSerializer.Serialize(lista, jsonOptions);
            }

            case "analizar_transacciones_rechazadas":
            {
                int? archivoId = argumentos.TryGetProperty("archivo_id", out var idProp) && idProp.ValueKind == JsonValueKind.Number
                    ? idProp.GetInt32()
                    : null;

                string? motivoFiltro = argumentos.TryGetProperty("motivo", out var motivoProp)
                    ? motivoProp.GetString()
                    : null;

                var query = dbContext.Transacciones
                    .AsNoTracking()
                    .Where(t => t.Estado == TransaccionEstado.RECHAZADA);

                if (archivoId.HasValue)
                    query = query.Where(t => t.ArchivoProcesadoId == archivoId.Value);

                if (!string.IsNullOrWhiteSpace(motivoFiltro))
                    query = query.Where(t => t.MotivoRechazo != null && t.MotivoRechazo.Contains(motivoFiltro));

                var rechazadas = await query
                    .Take(50)
                    .Select(t => new
                    {
                        t.Id,
                        t.ArchivoProcesadoId,
                        t.Cuenta,
                        t.Monto,
                        t.Fecha,
                        Estado = t.Estado.ToString(),
                        t.MotivoRechazo
                    })
                    .ToListAsync();

                return JsonSerializer.Serialize(rechazadas, jsonOptions);
            }

            case "corregir_transaccion":
            {
                int txId = argumentos.TryGetProperty("transaccion_id", out var idProp) ? idProp.GetInt32() : 0;
                decimal nuevoMonto = argumentos.TryGetProperty("nuevo_monto", out var montoProp)
                    ? (decimal)montoProp.GetDouble()
                    : 0m;

                // Cargar la transacción junto con su archivo de control
                var tx = await dbContext.Transacciones
                    .Include(t => t.ArchivoProcesado)
                    .FirstOrDefaultAsync(t => t.Id == txId);

                if (tx == null)
                    return JsonSerializer.Serialize(new { Exito = false, Error = $"Transacción ID {txId} no encontrada en MySQL." }, jsonOptions);

                if (!tx.EsModificable)
                    return JsonSerializer.Serialize(new { Exito = false, Error = $"La transacción ID {txId} no está en estado RECHAZADA, no se puede corregir." }, jsonOptions);

                if (!tx.EsEditable)
                    return JsonSerializer.Serialize(new { Exito = false, Error = $"La transacción ID {txId} fue rechazada por un motivo distinto a monto, no se puede editar desde aquí." }, jsonOptions);

                // Aplicar corrección usando los métodos del dominio
                tx.Aprobar();
                // Actualizar el monto directamente via EF (monto no tiene setter privado)
                dbContext.Entry(tx).Property(t => t.Monto).CurrentValue = nuevoMonto;

                // Actualizar contadores del archivo de control
                tx.ArchivoProcesado.RegistrarAprobada();

                await dbContext.SaveChangesAsync();

                return JsonSerializer.Serialize(new
                {
                    Exito = true,
                    Mensaje = $"Transacción ID {tx.Id} corregida y aprobada en MySQL.",
                    NuevoMonto = nuevoMonto,
                    EstadoTransaccion = tx.Estado.ToString(),
                    EstadoArchivo = tx.ArchivoProcesado.Estado.ToString()
                }, jsonOptions);
            }

            default:
                return JsonSerializer.Serialize(new { Error = $"Herramienta '{nombre}' no encontrada." }, jsonOptions);
        }
    }

    private static void SendResponse(long? id, object result)
    {
        if (!id.HasValue) return;
        var response = new { jsonrpc = "2.0", id = id.Value, result = result };
        Console.WriteLine(JsonSerializer.Serialize(response));
    }

    private static void SendError(long id, int code, string message)
    {
        var response = new { jsonrpc = "2.0", id = id, error = new { code = code, message = message } };
        Console.WriteLine(JsonSerializer.Serialize(response));
    }
}
