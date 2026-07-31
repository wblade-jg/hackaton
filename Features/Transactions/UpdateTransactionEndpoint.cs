using hackaton.Common;
using hackaton.Common.Validation;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
        TransactionValidator validator,
        ILogger<UpdateTransactionEndpoint> logger)
    {
        logger.LogInformation("Solicitada corrección de monto para la transacción ID {Id}. Nuevo monto: {Monto}", id, request.Monto);

        var transaccion = await db.Transacciones
            .Include(t => t.ArchivoProcesado)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaccion is null)
        {
            logger.LogWarning("No se encontró la transacción ID {Id} para actualización.", id);
            return TypedResults.NotFound(new ApiError($"No se encontró la transacción con ID {id}"));
        }

        if (!transaccion.EsEditable)
        {
            logger.LogWarning("La transacción ID {Id} no es editable. Estado actual: {Estado}", id, transaccion.Estado);
            return TypedResults.BadRequest(new ApiError("Solo se puede ajustar el monto de una transacción rechazada por motivo de monto."));
        }

        transaccion.Monto = request.Monto;

        var result = await validator.ValidateAsync(transaccion);

        if (result.IsValid)
        {
            transaccion.Aprobar();
            transaccion.ArchivoProcesado.RegistrarAprobada();
            logger.LogInformation("Transacción ID {Id} corregida exitosamente y APROBADA.", id);
        }
        else
        {
            transaccion.Rechazar(result.MotivoRechazo!);
            logger.LogWarning("Transacción ID {Id} sigue RECHAZADA tras modificación. Motivo: {Motivo}", id, result.MotivoRechazo);
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
