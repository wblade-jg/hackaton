using hackaton.Common;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files;

public class GetFileByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files/{id:int}", HandleAsync)
           .WithTags("Archivos")
           .WithSummary("Obtiene el detalle de un archivo procesado")
           .WithDescription("Devuelve el archivo junto con todas sus transacciones, incluidas las rechazadas y sus motivos de rechazo.");
    }

    private static async Task<Results<Ok<FileDetailResponse>, NotFound<ApiError>>> HandleAsync(int id, AppDbContext db)
    {
        var result = await db.ArchivosProcesados
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new FileDetailResponse(
                a.Id,
                a.NombreArchivo,
                a.FechaProceso,
                a.Estado.ToString(),
                a.TotalRegistros,
                a.Procesados,
                a.Rechazados,
                a.Transacciones
                    .OrderBy(t => t.Id)
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
                    .ToList()
            ))
            .SingleOrDefaultAsync();

        return result is null
            ? TypedResults.NotFound(new ApiError($"No se encontró el archivo con ID {id}"))
            : TypedResults.Ok(result);
    }
}
