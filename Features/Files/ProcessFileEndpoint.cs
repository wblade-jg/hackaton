using hackaton.Common;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace hackaton.Features.Files;

public class ProcessFileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/files/process", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(
        ProcessFileRequest? request,
        IFileScanner scanner,
        IOptions<FileScannerOptions> options,
        AppDbContext db,
        CsvFileProcessor processor)
    {
        if (string.IsNullOrWhiteSpace(request?.NombreArchivo))
            return Results.BadRequest(new { Message = "El nombre del archivo es obligatorio." });

        var alreadyProcessed = await db.ArchivosProcesados
            .AnyAsync(a => a.NombreArchivo == request.NombreArchivo);
        if (alreadyProcessed)
            return Results.Conflict(new { Message = $"El archivo '{request.NombreArchivo}' ya fue procesado." });

        FileEntry? fileEntry;
        try
        {
            fileEntry = scanner.GetMatchingFiles()
                .FirstOrDefault(f => f.NombreArchivo == request.NombreArchivo);
        }
        catch (DirectoryNotFoundException ex)
        {
            return Results.Problem(
                title: "Error de configuración",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }

        if (fileEntry is null)
            return Results.NotFound(new { Message = $"No se encontró el archivo '{request.NombreArchivo}' en el directorio de entrada." });

        var fullPath = Path.Combine(options.Value.InputDirectory, fileEntry.NombreArchivo);

        var archivo = await processor.ProcessAsync(fullPath, fileEntry.NombreArchivo);

        try
        {
            db.ArchivosProcesados.Add(archivo);
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Results.Conflict(new { Message = $"El archivo '{request.NombreArchivo}' ya fue procesado." });
        }

        return Results.Ok(ArchivoProcesadoResponse.From(archivo));
    }

    private record ProcessFileRequest(string? NombreArchivo);
}
