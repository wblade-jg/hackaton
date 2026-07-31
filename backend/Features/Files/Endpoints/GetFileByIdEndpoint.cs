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
           .WithDescription("Devuelve el archivo junto con las transacciones usando paginación por cursor y/o página, con soporte para filtrado por estado.");
    }

    private static async Task<Results<Ok<FileDetailResponse>, NotFound<ApiError>, BadRequest<ApiError>>> HandleAsync(
        int id,
        [FromQuery] string? cursor,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] string? status,
        AppDbContext db)
    {
        if (pageSize is not null && pageSize <= 0)
            return TypedResults.BadRequest(new ApiError("El tamaño de página debe ser mayor que cero."));

        if (page is not null && page <= 0)
            return TypedResults.BadRequest(new ApiError("El número de página debe ser mayor que cero."));

        TransaccionEstado? estadoFiltro = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status.Equals("PROCESADO", StringComparison.OrdinalIgnoreCase))
                estadoFiltro = TransaccionEstado.PROCESADO;
            else if (status.Equals("RECHAZADA", StringComparison.OrdinalIgnoreCase))
                estadoFiltro = TransaccionEstado.RECHAZADA;
            else
                return TypedResults.BadRequest(new ApiError("El parámetro 'status' debe ser 'PROCESADO' o 'RECHAZADA'."));
        }

        var effectivePageSize = pageSize ?? 10;
        var currentPage = page ?? 1;

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
            return TypedResults.NotFound(new ApiError($"No se encontró el archivo con ID {id}"));

        var baseQuery = db.Transacciones
            .AsNoTracking()
            .Where(t => t.ArchivoProcesadoId == id);

        if (estadoFiltro.HasValue)
            baseQuery = baseQuery.Where(t => t.Estado == estadoFiltro.Value);

        var filteredTotal = await baseQuery.CountAsync();

        var query = baseQuery;

        if (cursorPayload is not null)
        {
            query = query.Where(t => t.Id > cursorPayload.Id);
        }
        else if (page is not null && page > 1)
        {
            var skipAmount = (currentPage - 1) * effectivePageSize;
            query = query.Skip(skipAmount);
        }

        var rawTransactions = await query
            .OrderBy(t => t.Id)
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

        var hasNextPage = rawTransactions.Count > effectivePageSize;
        var pageTransactions = hasNextPage ? rawTransactions.Take(effectivePageSize).ToList() : rawTransactions;

        var nextCursor = hasNextPage && pageTransactions.Count > 0
            ? EncodeCursor(pageTransactions[^1].Fecha, pageTransactions[^1].Id)
            : null;

        var totalPages = filteredTotal <= 0
            ? 1
            : (int)Math.Ceiling(filteredTotal / (double)effectivePageSize);

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
            currentPage,
            totalPages,
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
                throw new FormatException("El cursor no contiene un payload válido.");

            return payload;
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
        if (padding is < 4 and > 0)
            normalized += new string('=', padding);

        return Convert.FromBase64String(normalized);
    }

    private sealed class CursorPayload
    {
        public DateTimeOffset CreatedAt { get; set; }
        public int Id { get; set; }
    }
}
