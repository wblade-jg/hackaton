using hackaton.Common;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Features.Transactions;

public class UpdateTransactionEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/transactions/{id:int}", HandleAsync)
           .WithTags("Transacciones")
           .WithSummary("Corrige el monto de una transacción rechazada")
           .WithDescription("Modifica el monto de una transacción rechazada por motivo de monto y re-ejecuta las validaciones de negocio para actualizar su estado.");
    }

    private static async Task<Results<Ok<TransaccionResponse>, BadRequest<ApiError>, NotFound<ApiError>>> HandleAsync(
        int id,
        UpdateMontoRequest request,
        AppDbContext db,
        TransactionValidator validator)
    {
        var transaccion = await db.Transacciones
            .Include(t => t.ArchivoProcesado)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaccion is null)
            return TypedResults.NotFound(new ApiError($"No se encontró la transacción con ID {id}"));

        if (!transaccion.EsEditable)
            return TypedResults.BadRequest(new ApiError("Solo se puede ajustar el monto de una transacción rechazada por motivo de monto."));

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

        return TypedResults.Ok(new TransaccionResponse(
            transaccion.Id,
            transaccion.Cuenta,
            transaccion.Monto,
            transaccion.Fecha,
            transaccion.Estado.ToString(),
            transaccion.MotivoRechazo,
            transaccion.EsEditable
        ));
    }
}
