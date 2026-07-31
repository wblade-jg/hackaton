using hackaton.Common;
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
        List<FileEntry> onDisk;
        try
        {
            onDisk = scanner.GetMatchingFiles().ToList();
        }
        catch (DirectoryNotFoundException ex)
        {
            return Results.Problem(
                title: "Error de configuración",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }

        var processed = await db.ArchivosProcesados
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
