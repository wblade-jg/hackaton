using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence.Entities;
using System.Globalization;
using System.Text;

namespace hackaton.Features.Files;

public class CsvFileProcessor
{
    private readonly TransactionValidator _validator;

    public CsvFileProcessor(TransactionValidator validator)
    {
        _validator = validator;
    }

    public async Task<ArchivoProcesado> ProcessAsync(string fullPath, string nombreArchivo)
    {
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
                }

                transacciones.Add(transaccion);
            }
        }
        catch (Exception ex) when (ex is IOException or DecoderFallbackException or CsvHelperException)
        {
            archivo.MarcarFallido();
        }

        if (archivo.Estado == ArchivoEstado.FALLIDO)
            return archivo;

        archivo.TotalRegistros = totalRows;
        archivo.Transacciones = transacciones;

        if (totalRows == 0)
            archivo.MarcarFallido();

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
