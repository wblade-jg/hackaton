using hackaton.Application;
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
        var files = await db.ArchivoControls
            .OrderByDescending(a => a.FechaProceso)
            .Select(a => new Response(
                a.Id,
                a.NombreArchivo,
                a.FechaProceso,
                a.Estado,
                a.TotalRegistros,
                a.Procesados,
                a.Rechazados))
            .ToListAsync();

        return Results.Ok(files);
    }

    private record Response(
        int Id,
        string NombreArchivo,
        DateTime FechaProceso,
        string Estado,
        int TotalRegistros,
        int Procesados,
        int Rechazados);
}
