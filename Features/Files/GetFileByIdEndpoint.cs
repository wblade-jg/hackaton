using hackaton.Application;
using hackaton.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Files;

public class GetFileByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/files/{id:int}", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(int id, AppDbContext db)
    {
        var result = await db.ArchivoControls
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new FileDetailResponse(
                a.Id,
                a.NombreArchivo,
                a.FechaProceso,
                a.Estado,
                a.TotalRegistros,
                a.Procesados,
                a.Rechazados,
                a.Transacciones
                    .OrderBy(t => t.Id)
                    .Select(t => new TransaccionResponse(
                        t.Id,
                        t.Cuenta,
                        t.Monto,
                        t.Fecha,
                        t.Estado,
                        t.MotivoRechazo))
                    .ToList()
            ))
            .SingleOrDefaultAsync();

        return result is null
            ? Results.NotFound(new { Message = $"No se encontró el archivo con ID {id}" })
            : Results.Ok(result);
    }

    private record FileDetailResponse(
        int Id,
        string NombreArchivo,
        DateTime FechaProceso,
        string Estado,
        int TotalRegistros,
        int Procesados,
        int Rechazados,
        List<TransaccionResponse> Transacciones
    );

    private record TransaccionResponse(
        int Id,
        string Cuenta,
        decimal Monto,
        DateTime Fecha,
        string Estado,
        string? MotivoRechazo);
}
