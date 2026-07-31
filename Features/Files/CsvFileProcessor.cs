using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text;

namespace hackaton.Features.Files;

public class CsvFileProcessor
{
    private readonly TransactionValidator _validator;
    private readonly ILogger<CsvFileProcessor> _logger;

    public CsvFileProcessor(TransactionValidator validator, ILogger<CsvFileProcessor> logger)
    {
        _validator = validator;
        _logger = logger;
    }

    public async Task<ArchivoProcesado> ProcessAsync(string fullPath, string nombreArchivo)
    {
        _logger.LogInformation("Iniciando procesamiento del archivo CSV: {NombreArchivo} ({Ruta})", nombreArchivo, fullPath);

        var archivo = new ArchivoProcesado
        {
            NombreArchivo = nombreArchivo,
            FechaProceso = DateTime.Now
        };

        var transacciones = new List<Transaccion>();
        var seenKeys = new HashSet<string>();
        var totalRows = 0;

        try
        {
            using var reader = new StreamReader(fullPath, new UTF8Encoding(false, true), detectEncodingFromByteOrderMarks: true);
            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                DetectColumnCountChanges = true,
                BadDataFound = _ => throw new InvalidDataException("Estructura del CSV inválida.")
            });

            while (await csv.ReadAsync())
            {
                totalRows++;

                var row = csv.GetRecord<TransactionCsvRow>();
                var (transaccion, result) = await _validator.ValidateNewAsync(
                    row.Cuenta?.Trim() ?? string.Empty, row.Monto, row.Fecha, seenKeys);

                if (result.IsValid)
                {
                    transaccion.Aprobar();
                    archivo.RegistrarNuevaAprobada();
                }
                else
                {
                    transaccion.Rechazar(result.MotivoRechazo!);
                    archivo.RegistrarNuevaRechazada();
                    _logger.LogWarning("Transacción rechazada en fila {Fila} del archivo {NombreArchivo}: {Motivo}", 
                        totalRows, nombreArchivo, result.MotivoRechazo);
                }

                transacciones.Add(transaccion);
            }
        }
        catch (Exception ex) when (ex is IOException or DecoderFallbackException or CsvHelperException or InvalidDataException)
        {
            _logger.LogError(ex, "Error fatal al procesar archivo {NombreArchivo}. Se marcará como FALLIDO.", nombreArchivo);
            archivo.MarcarFallido();
        }

        if (archivo.Estado == ArchivoEstado.FALLIDO)
        {
            _logger.LogError("El archivo {NombreArchivo} fue procesado con estado FALLIDO.", nombreArchivo);
            return archivo;
        }

        archivo.TotalRegistros = totalRows;
        archivo.Transacciones = transacciones;

        if (totalRows == 0)
        {
            _logger.LogWarning("El archivo {NombreArchivo} está vacío. Se marcará como FALLIDO.", nombreArchivo);
            archivo.MarcarFallido();
        }
        else
        {
            _logger.LogInformation("Procesamiento completado para {NombreArchivo}. Estado: {Estado}, Total: {Total}, Procesados: {Procesados}, Rechazados: {Rechazados}",
                nombreArchivo, archivo.Estado, archivo.TotalRegistros, archivo.Procesados, archivo.Rechazados);
        }

        return archivo;
    }
}

public sealed class TransactionCsvRow
{
    [Name("Cuenta")]
    public string? Cuenta { get; set; }

    [Name("Monto")]
    public string? Monto { get; set; }

    [Name("Fecha")]
    public string? Fecha { get; set; }
}
