using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text;

namespace hackaton.Features.Files.Services;


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
        _logger.LogInformation(
            "Iniciando procesamiento del archivo CSV: {NombreArchivo} ({Ruta})",
            nombreArchivo, fullPath);

        var archivo = new ArchivoProcesado
        {
            NombreArchivo = nombreArchivo,
            FechaProceso = DateTime.Now,
        };

        // ── Pass 1: collect candidate duplicate keys (stream, minimal memory) ──────
        List<string> candidateKeys;
        int totalRows;

        try
        {
            (candidateKeys, totalRows) = await ScanCandidateKeysAsync(fullPath, nombreArchivo);
        }
        catch (Exception ex) when (ex is IOException or DecoderFallbackException or CsvHelperException or InvalidDataException)
        {
            _logger.LogError(ex, "Error fatal al leer archivo {NombreArchivo}. Se marcará como FALLIDO.", nombreArchivo);
            archivo.MarcarFallido();
            return archivo;
        }

        if (totalRows == 0)
        {
            _logger.LogWarning("El archivo {NombreArchivo} está vacío. Se marcará como FALLIDO.", nombreArchivo);
            archivo.MarcarFallido();
            return archivo;
        }

        // ── Resolve which keys already exist in the DB (single batch query) ────────
        var existingDuplicateKeys = await _validator.LoadExistingDuplicateKeysAsync(candidateKeys);

        // ── Pass 2: validate and build entities (stream, no large list) ────────────
        var transacciones = new List<Transaccion>(totalRows);
        var seenKeys = new HashSet<string>(totalRows, StringComparer.Ordinal);

        try
        {
            await foreach (var (transaccion, result, fila) in ValidateRowsAsync(fullPath, seenKeys, existingDuplicateKeys))
            {
                if (result.IsValid)
                {
                    transaccion.Aprobar();
                    archivo.RegistrarNuevaAprobada();
                }
                else
                {
                    transaccion.Rechazar(result.MotivoRechazo!);
                    archivo.RegistrarNuevaRechazada();
                    _logger.LogWarning(
                        "Transacción rechazada en fila {Fila} del archivo {NombreArchivo}: {Motivo}",
                        fila, nombreArchivo, result.MotivoRechazo);
                }

                transacciones.Add(transaccion);
            }
        }
        catch (Exception ex) when (ex is IOException or DecoderFallbackException or CsvHelperException or InvalidDataException)
        {
            _logger.LogError(ex, "Error fatal al procesar archivo {NombreArchivo}. Se marcará como FALLIDO.", nombreArchivo);
            archivo.MarcarFallido();
            return archivo;
        }

        archivo.TotalRegistros = totalRows;
        archivo.Transacciones = transacciones;

        _logger.LogInformation(
            "Procesamiento completado para {NombreArchivo}. Estado: {Estado}, Total: {Total}, Procesados: {Procesados}, Rechazados: {Rechazados}",
            nombreArchivo, archivo.Estado, archivo.TotalRegistros, archivo.Procesados, archivo.Rechazados);

        return archivo;
    }

    // ── Pass 1 helper ─────────────────────────────────────────────────────────────

    private async Task<(List<string> CandidateKeys, int TotalRows)> ScanCandidateKeysAsync(
        string fullPath, string nombreArchivo)
    {
        var keys = new List<string>();
        var count = 0;

        using var reader = OpenReader(fullPath);
        using var csv = BuildCsvReader(reader);

        while (await csv.ReadAsync())
        {
            count++;
            var row = csv.GetRecord<TransactionCsvRow>();

            if (_validator.TryCreateDuplicateKey(
                    row.Cuenta?.Trim() ?? string.Empty,
                    row.Monto,
                    row.Fecha,
                    out var key))
            {
                keys.Add(key);
            }
        }

        return (keys, count);
    }

    // ── Pass 2 helper (async stream) ──────────────────────────────────────────────

    private async IAsyncEnumerable<(Transaccion Transaccion, ValidationResult Result, int Fila)> ValidateRowsAsync(
        string fullPath,
        ISet<string> seenKeys,
        HashSet<string> existingDuplicateKeys)
    {
        using var reader = OpenReader(fullPath);
        using var csv = BuildCsvReader(reader);

        var index = 0;
        while (await csv.ReadAsync())
        {
            index++;
            var row = csv.GetRecord<TransactionCsvRow>();

            var (transaccion, result) = await _validator.ValidateNewAsync(
                row.Cuenta?.Trim() ?? string.Empty,
                row.Monto,
                row.Fecha,
                seenKeys,
                existingDuplicateKeys);

            yield return (transaccion, result, index);
        }
    }

    // ── Shared helpers ────────────────────────────────────────────────────────────

    private static StreamReader OpenReader(string fullPath) =>
        new(fullPath, new UTF8Encoding(false, true), detectEncodingFromByteOrderMarks: true);

    private static CsvReader BuildCsvReader(StreamReader reader) =>
        new(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null,
            DetectColumnCountChanges = true,
            BadDataFound = _ => throw new InvalidDataException("Estructura del CSV inválida."),
        });
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
