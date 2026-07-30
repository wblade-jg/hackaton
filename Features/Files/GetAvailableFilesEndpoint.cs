using hackaton.Application;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files;

public class GetAvailableFilesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files/available", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(
        IFileScanner scanner,
        AppDbContext db)
    {
        var onDisk = scanner.GetMatchingFiles().ToList();
        var processed = await db.ArchivoControls
            .Where(a => a.Estado == "PROCESADO" || a.Estado == "CON_ERRORES")
            .Select(a => a.NombreArchivo)
            .ToHashSetAsync();

        var available = onDisk
            .Where(f => !processed.Contains(f.NombreArchivo))
            .Select(f => new Response(f.NombreArchivo, f.Fecha.ToString("yyyy-MM-dd")))
            .ToList();

        return Results.Ok(available);
    }

    private record Response(string NombreArchivo, string Fecha);
}
