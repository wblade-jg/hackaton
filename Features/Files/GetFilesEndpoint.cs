using hackaton.Common;
using hackaton.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files;

public class GetFilesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files", HandleAsync)
           .WithTags("Archivos")
           .WithSummary("Lista los archivos procesados")
           .WithDescription("Devuelve el historial de archivos procesados, ordenado por fecha de proceso descendente.");
    }

    private static async Task<Ok<List<ArchivoProcesadoResponse>>> HandleAsync(AppDbContext db)
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

        return TypedResults.Ok(files);
    }
}
