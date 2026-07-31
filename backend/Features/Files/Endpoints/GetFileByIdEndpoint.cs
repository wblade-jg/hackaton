using System.Text;
using System.Text.Json;
using hackaton.Common;
using hackaton.Common.Validation;
using hackaton.Features.Files.DTOs;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files.Endpoints;

public class GetFileByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files/{id:int}", HandleAsync)
           .WithTags("Archivos")
           .WithSummary("Obtiene el detalle de un archivo procesado")
           .WithDescription("Devuelve el archivo junto con una página de transacciones usando paginación por cursor.");
    }

    private static async Task<Results<Ok<FileDetailResponse>, NotFound<ApiError>, BadRequest<ApiError>>> HandleAsync(
        int id,
        [FromQuery] string? cursor,
        [FromQuery] int? pageSize,
        AppDbContext db)
    {
        if (pageSize is not null && pageSize <= 0)
        {
            return TypedResults.BadRequest(new ApiError("El tamaño de página debe ser mayor que cero."));
        }

        var effectivePageSize = pageSize ?? 10;
        CursorPayload? cursorPayload = null;

        if (!string.IsNullOrWhiteSpace(cursor))
        {
            try
            {
                cursorPayload = DecodeCursor(cursor);
            }
            catch (FormatException)
            {
                return TypedResults.BadRequest(new ApiError("El cursor proporcionado es inválido."));
            }
        }

        var fileInfo = await db.ArchivosProcesados
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new
            {
                a.Id,
                a.NombreArchivo,
                a.FechaProceso,
                a.Estado,
                a.TotalRegistros,
                a.Procesados,
                a.Rechazados,
            })
            .SingleOrDefaultAsync();

        if (fileInfo is null)
        {
            return TypedResults.NotFound(new ApiError($"No se encontró el archivo con ID {id}"));
        }

        var transactionsQuery = db.Transacciones
            .AsNoTracking()
            .Where(t => t.ArchivoProcesadoId == id);

        if (cursorPayload is not null)
        {
            transactionsQuery = transactionsQuery.Where(t =>
                t.Fecha < cursorPayload.CreatedAt.UtcDateTime ||
                (t.Fecha == cursorPayload.CreatedAt.UtcDateTime && t.Id < cursorPayload.Id));
        }

        var transactions = await transactionsQuery
            .OrderByDescending(t => t.Fecha)
            .ThenByDescending(t => t.Id)
            .Take(effectivePageSize + 1)
            .Select(t => new TransaccionDetailResponse(
                t.Id,
                t.Cuenta,
                t.Monto,
                t.Fecha,
                t.Estado.ToString(),
                t.MotivoRechazo,
                t.Estado == TransaccionEstado.RECHAZADA
                    && (t.MotivoRechazo == RechazoMotivos.MontoNoNumerico
                        || t.MotivoRechazo == RechazoMotivos.MontoNoPositivo)))
            .ToListAsync();

        var hasNextPage = transactions.Count > effectivePageSize;
        var pageTransactions = hasNextPage ? transactions.Take(effectivePageSize).ToList() : transactions;
        var nextCursor = hasNextPage && pageTransactions.Count > 0
            ? EncodeCursor(pageTransactions[^1].Fecha, pageTransactions[^1].Id)
            : null;

        var response = new FileDetailResponse(
            fileInfo.Id,
            fileInfo.NombreArchivo,
            fileInfo.FechaProceso,
            fileInfo.Estado.ToString(),
            fileInfo.TotalRegistros,
            fileInfo.Procesados,
            fileInfo.Rechazados,
            pageTransactions,
            nextCursor,
            hasNextPage,
            effectivePageSize);

        return TypedResults.Ok(response);
    }

    private static string EncodeCursor(DateTime createdAt, int id)
    {
        var payload = new CursorPayload
        {
            CreatedAt = createdAt.ToUniversalTime(),
            Id = id,
        };

        var json = JsonSerializer.Serialize(payload);
        return ToBase64Url(Encoding.UTF8.GetBytes(json));
    }

    private static CursorPayload DecodeCursor(string cursor)
    {
        try
        {
            var bytes = FromBase64Url(cursor);
            var json = Encoding.UTF8.GetString(bytes);
            var payload = JsonSerializer.Deserialize<CursorPayload>(json);

            if (payload is null || payload.Id <= 0)
            {
                throw new FormatException("El cursor no contiene un payload válido.");
            }

            return payload;
        }
        catch (FormatException)
        {
            throw;
        }
        catch (Exception)
        {
            throw new FormatException("No se pudo decodificar el cursor.");
        }
    }

    private static string ToBase64Url(byte[] bytes)
    {
        var base64 = Convert.ToBase64String(bytes);
        return base64.TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static byte[] FromBase64Url(string value)
    {
        var normalized = value.Replace('-', '+').Replace('_', '/');
        var padding = 4 - (normalized.Length % 4);
        if (padding is < 4 && padding > 0)
        {
            normalized += new string('=', padding);
        }

        return Convert.FromBase64String(normalized);
    }

    private sealed class CursorPayload
    {
        public DateTimeOffset CreatedAt { get; set; }
        public int Id { get; set; }
    }
}
