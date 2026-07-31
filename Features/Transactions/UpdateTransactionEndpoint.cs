using hackaton.Common;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Transactions;

public class UpdateTransactionEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/transactions/{id:int}", HandleAsync);
    }

    private static async Task<IResult> HandleAsync(
        int id,
        UpdateMontoRequest request,
        AppDbContext db,
        TransactionValidator validator)
    {
        var transaccion = await db.Transacciones
            .Include(t => t.ArchivoProcesado)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaccion is null)
            return Results.NotFound(new { Message = $"No se encontró la transacción con ID {id}" });

        if (!transaccion.EsModificable)
            return Results.BadRequest(new { Message = "Solo se puede modificar una transacción rechazada." });

        transaccion.Monto = request.Monto;

        var result = await validator.ValidateAsync(transaccion);

        if (result.IsValid)
        {
            transaccion.Aprobar();
            transaccion.ArchivoProcesado.RegistrarAprobada();
        }
        else
        {
            transaccion.Rechazar(result.MotivoRechazo!);
        }

        await db.SaveChangesAsync();

        return Results.Ok(new TransaccionResponse(
            transaccion.Id,
            transaccion.Cuenta,
            transaccion.Monto,
            transaccion.Fecha,
            transaccion.Estado.ToString(),
            transaccion.MotivoRechazo
        ));
    }

    private record UpdateMontoRequest(decimal Monto);

    private record TransaccionResponse(
        int Id,
        string Cuenta,
        decimal Monto,
        DateTime Fecha,
        string Estado,
        string? MotivoRechazo);
}
