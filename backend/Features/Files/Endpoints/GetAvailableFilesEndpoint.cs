using hackaton.Common;
using hackaton.Features.Files.DTOs;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace hackaton.Features.Files.Endpoints;

public class GetAvailableFilesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files/available", HandleAsync)
           .WithTags("Archivos")
           .WithSummary("Lista los archivos disponibles para procesar")
           .WithDescription("Escanea el directorio de entrada y filtra los archivos que ya fueron registrados en la base de datos. Incluye el tamaño en bytes y el conteo de filas de cada archivo.");
    }

    private static async Task<Results<Ok<List<ArchivoDisponibleResponse>>, ProblemHttpResult>> HandleAsync(
        IFileScanner scanner,
        IOptions<FileScannerOptions> options,
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

        var inputDir = options.Value.InputDirectory;

        var available = onDisk
            .Where(f => !processed.Contains(f.NombreArchivo))
            .Select(f =>
            {
                var fullPath = Path.Combine(inputDir, f.NombreArchivo);
                var (sizeBytes, totalFilas) = GetFileMetadata(fullPath);
                return new ArchivoDisponibleResponse(
                    f.NombreArchivo,
                    f.Fecha.ToString("yyyy-MM-dd"),
                    sizeBytes,
                    totalFilas);
            })
            .ToList();

        return TypedResults.Ok(available);
    }

    /// <summary>
    /// Returns the file size in bytes and the number of data rows (header excluded).
    /// Uses buffered line counting to avoid loading the entire file into memory.
    /// </summary>
    private static (long SizeBytes, int TotalFilas) GetFileMetadata(string fullPath)
    {
        try
        {
            var info = new FileInfo(fullPath);
            if (!info.Exists) return (0, 0);

            var sizeBytes = info.Length;

            // Count lines efficiently using a buffer; subtract 1 for the header row.
            var lineCount = 0;
            using var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize: 65536);
            using var reader = new StreamReader(stream);

            while (reader.ReadLine() is not null)
                lineCount++;

            // lineCount includes the header; data rows = lineCount - 1 (minimum 0).
            var dataRows = Math.Max(0, lineCount - 1);

            return (sizeBytes, dataRows);
        }
        catch
        {
            return (0, 0);
        }
    }
}
