using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace hackaton.Common.Validation;

public class TransactionValidator
{
    private readonly AppDbContext _db;

    public TransactionValidator(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(Transaccion Transaccion, ValidationResult Result)> ValidateNewAsync(
        string cuenta, string? montoRaw, string? fechaRaw, ISet<string> seenKeys)
    {
        var transaccion = new Transaccion { Cuenta = cuenta };

        var montoValido = decimal.TryParse(montoRaw?.Trim(),
            NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign,
            CultureInfo.InvariantCulture, out var monto);
        if (montoValido)
            transaccion.Monto = monto;

        var fechaValida = DateOnly.TryParseExact(fechaRaw?.Trim(), "dd/MM/yyyy",
            CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha);
        if (fechaValida)
            transaccion.Fecha = fecha.ToDateTime(TimeOnly.MinValue);

        if (!montoValido)
            return (transaccion, new ValidationResult(false, RechazoMotivos.MontoNoNumerico));

        if (!fechaValida)
            return (transaccion, new ValidationResult(false, RechazoMotivos.FechaFormatoInvalido));

        var key = $"{transaccion.Cuenta}|{fecha:dd/MM/yyyy}|{monto}";
        if (!seenKeys.Add(key))
            return (transaccion, new ValidationResult(false, RechazoMotivos.Duplicado));

        return (transaccion, await ValidateAsync(transaccion));
    }

    public async Task<ValidationResult> ValidateAsync(Transaccion transaccion)
    {
        if (string.IsNullOrEmpty(transaccion.Cuenta)
            || transaccion.Cuenta.Length != 10
            || !transaccion.Cuenta.All(char.IsDigit))
            return new ValidationResult(false, RechazoMotivos.CuentaInvalida);

        if (transaccion.Monto <= 0)
            return new ValidationResult(false, RechazoMotivos.MontoNoPositivo);

        if (transaccion.Fecha == default)
            return new ValidationResult(false, RechazoMotivos.FechaInvalida);

        var excludeId = transaccion.Id > 0 ? transaccion.Id : (int?)null;

        var duplicateExists = await _db.Transacciones
            .AnyAsync(t =>
                t.Cuenta == transaccion.Cuenta &&
                t.Fecha == transaccion.Fecha &&
                t.Monto == transaccion.Monto &&
                (excludeId == null || t.Id != excludeId));

        if (duplicateExists)
            return new ValidationResult(false, RechazoMotivos.Duplicado);

        return new ValidationResult(true, null);
    }
}

public record ValidationResult(bool IsValid, string? MotivoRechazo);
