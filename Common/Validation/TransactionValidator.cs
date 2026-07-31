using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Common.Validation;

public class TransactionValidator
{
    private readonly AppDbContext _db;

    public TransactionValidator(AppDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Valida los campos de negocio de una transacción y verifica unicidad contra la base de datos.
    /// </summary>
    /// <param name="transaccion">Entidad a validar. Para actualizaciones, su Id se excluye del chequeo de duplicados.</param>
    public async Task<ValidationResult> ValidateAsync(Transaccion transaccion)
    {
        if (string.IsNullOrEmpty(transaccion.Cuenta)
            || transaccion.Cuenta.Length != 10
            || !transaccion.Cuenta.All(char.IsDigit))
            return new ValidationResult(false, "La cuenta debe tener exactamente 10 dígitos numéricos.");

        if (transaccion.Monto <= 0)
            return new ValidationResult(false, "El monto debe ser un valor monetario positivo.");

        if (transaccion.Fecha == default)
            return new ValidationResult(false, "La fecha no es una fecha válida.");

        var excludeId = transaccion.Id > 0 ? transaccion.Id : (int?)null;

        var duplicateExists = await _db.Transacciones
            .AnyAsync(t =>
                t.Cuenta == transaccion.Cuenta &&
                t.Fecha == transaccion.Fecha &&
                t.Monto == transaccion.Monto &&
                (excludeId == null || t.Id != excludeId));

        if (duplicateExists)
            return new ValidationResult(false, "Ya existe una transacción con la misma cuenta, fecha y monto.");

        return new ValidationResult(true, null);
    }
}

public record ValidationResult(bool IsValid, string? MotivoRechazo);
