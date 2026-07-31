using hackaton.Common;
using hackaton.Features.Files.DTOs;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files.Endpoints;

public class GetAvailableFilesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files/available", HandleAsync)
           .WithTags("Archivos")
           .WithSummary("Lista los archivos disponibles para procesar")
           .WithDescription("Escanea el directorio de entrada y filtra los archivos que ya fueron registrados en la base de datos.");
    }

    private static async Task<Results<Ok<List<ArchivoDisponibleResponse>>, ProblemHttpResult>> HandleAsync(
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
            return TypedResults.Problem(
                title: "Error de configuración",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }

        var processed = await db.ArchivosProcesados
            .Select(a => a.NombreArchivo)
            .ToHashSetAsync();

        var available = onDisk
            .Where(f => !processed.Contains(f.NombreArchivo))
            .Select(f => new ArchivoDisponibleResponse(f.NombreArchivo, f.Fecha.ToString("yyyy-MM-dd")))
            .ToList();

        return TypedResults.Ok(available);
    }
}
