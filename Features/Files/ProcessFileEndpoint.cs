using hackaton.Common;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace hackaton.Features.Files;

public class ProcessFileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/files/process", HandleAsync)
           .WithTags("Archivos")
           .WithSummary("Procesa un archivo CSV de transacciones")
           .WithDescription("Valida cada transacción (cuenta de 10 dígitos, monto positivo y fecha válida) y registra el resultado del lote. Si el archivo ya fue procesado responde 409.");
    }

    private static async Task<Results<Ok<ArchivoProcesadoResponse>, BadRequest<ApiError>, NotFound<ApiError>, Conflict<ApiError>, ProblemHttpResult>> HandleAsync(
        ProcessFileRequest? request,
        IFileScanner scanner,
        IOptions<FileScannerOptions> options,
        AppDbContext db,
        CsvFileProcessor processor)
    {
        if (string.IsNullOrWhiteSpace(request?.NombreArchivo))
            return TypedResults.BadRequest(new ApiError("El nombre del archivo es obligatorio."));

        var alreadyProcessed = await db.ArchivosProcesados
            .AnyAsync(a => a.NombreArchivo == request.NombreArchivo);
        if (alreadyProcessed)
            return TypedResults.Conflict(new ApiError($"El archivo '{request.NombreArchivo}' ya fue procesado."));

        FileEntry? fileEntry;
        try
        {
            fileEntry = scanner.GetMatchingFiles()
                .FirstOrDefault(f => f.NombreArchivo == request.NombreArchivo);
        }
        catch (DirectoryNotFoundException ex)
        {
            return TypedResults.Problem(
                title: "Error de configuración",
                detail: ex.Message,
                statusCode: StatusCodes.Status500InternalServerError);
        }

        if (fileEntry is null)
            return TypedResults.NotFound(new ApiError($"No se encontró el archivo '{request.NombreArchivo}' en el directorio de entrada."));

        var fullPath = Path.Combine(options.Value.InputDirectory, fileEntry.NombreArchivo);

        var archivo = await processor.ProcessAsync(fullPath, fileEntry.NombreArchivo);

        try
        {
            db.ArchivosProcesados.Add(archivo);
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return TypedResults.Conflict(new ApiError($"El archivo '{request.NombreArchivo}' ya fue procesado."));
        }

        return TypedResults.Ok(ArchivoProcesadoResponse.From(archivo));
    }
}
