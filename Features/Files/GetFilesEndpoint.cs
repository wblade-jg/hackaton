using hackaton.Common;
using hackaton.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files;

public class GetFilesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(AppDbContext db)
    {
        var files = await db.ArchivosProcesados
            .OrderByDescending(a => a.FechaProceso)
            .Select(a => new ArchivoProcesadoResponse(
                a.Id,
                a.NombreArchivo,
                a.FechaProceso,
                a.Estado.ToString(),
                a.TotalRegistros,
                a.Procesados,
                a.Rechazados))
            .ToListAsync();

        return Results.Ok(files);
    }
}
