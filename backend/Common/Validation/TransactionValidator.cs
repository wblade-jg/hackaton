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

    public static string CreateDuplicateKey(string cuenta, DateTime fecha, decimal monto)
    {
        return $"{cuenta}|{fecha:dd/MM/yyyy}|{monto.ToString(CultureInfo.InvariantCulture)}";
    }

    public bool TryCreateDuplicateKey(string cuenta, string? montoRaw, string? fechaRaw, out string key)
    {
        key = string.Empty;
        var normalizedCuenta = cuenta.Trim();

        var montoValido = decimal.TryParse(montoRaw?.Trim(),
            NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign,
            CultureInfo.InvariantCulture, out var monto);
        if (!montoValido)
            return false;

        var fechaValida = DateOnly.TryParseExact(fechaRaw?.Trim(), "dd/MM/yyyy",
            CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha);
        if (!fechaValida)
            return false;

        key = CreateDuplicateKey(normalizedCuenta, fecha.ToDateTime(TimeOnly.MinValue), monto);
        return true;
    }

    public async Task<HashSet<string>> LoadExistingDuplicateKeysAsync(IEnumerable<string> candidateKeys)
    {
        var distinctCandidates = candidateKeys
            .Where(k => !string.IsNullOrWhiteSpace(k))
            .Distinct()
            .Select(ParseDuplicateKey)
            .Where(k => k is not null)
            .Select(k => k!)
            .ToList();

        if (distinctCandidates.Count == 0)
            return new HashSet<string>();

        var cuentas = distinctCandidates.Select(k => k.Cuenta).Distinct().ToList();
        var fechas = distinctCandidates.Select(k => k.Fecha).Distinct().ToList();

        var possibleMatches = await _db.Transacciones
            .Where(t => cuentas.Contains(t.Cuenta) && fechas.Contains(t.Fecha))
            .Select(t => new { t.Cuenta, t.Fecha, t.Monto })
            .ToListAsync();

        var candidateKeySet = distinctCandidates
            .Select(c => CreateDuplicateKey(c.Cuenta, c.Fecha, c.Monto))
            .ToHashSet();

        return possibleMatches
            .Select(m => CreateDuplicateKey(m.Cuenta, m.Fecha, m.Monto))
            .Where(candidateKeySet.Contains)
            .ToHashSet();
    }

    public async Task<(Transaccion Transaccion, ValidationResult Result)> ValidateNewAsync(
        string cuenta, string? montoRaw, string? fechaRaw, ISet<string> seenKeys, HashSet<string>? existingDuplicateKeys = null)
    {
        var normalizedCuenta = cuenta.Trim();
        var transaccion = new Transaccion { Cuenta = normalizedCuenta };

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

        var key = CreateDuplicateKey(normalizedCuenta, transaccion.Fecha, transaccion.Monto);
        if (!seenKeys.Add(key))
            return (transaccion, new ValidationResult(false, RechazoMotivos.Duplicado));

        if (existingDuplicateKeys?.Contains(key) == true)
            return (transaccion, new ValidationResult(false, RechazoMotivos.Duplicado));

        return (transaccion, await ValidateAsync(transaccion, existingDuplicateKeys));
    }

    public async Task<ValidationResult> ValidateAsync(Transaccion transaccion, HashSet<string>? existingDuplicateKeys = null)
    {
        if (string.IsNullOrEmpty(transaccion.Cuenta)
            || transaccion.Cuenta.Length != 10
            || !transaccion.Cuenta.All(char.IsDigit))
            return new ValidationResult(false, RechazoMotivos.CuentaInvalida);

        if (transaccion.Monto <= 0)
            return new ValidationResult(false, RechazoMotivos.MontoNoPositivo);

        if (transaccion.Fecha == default)
            return new ValidationResult(false, RechazoMotivos.FechaInvalida);

        var key = CreateDuplicateKey(transaccion.Cuenta, transaccion.Fecha, transaccion.Monto);
        if (existingDuplicateKeys?.Contains(key) == true)
            return new ValidationResult(false, RechazoMotivos.Duplicado);

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

    private static DuplicateKey? ParseDuplicateKey(string key)
    {
        var parts = key.Split('|');
        if (parts.Length != 3)
            return null;

        var cuenta = parts[0];
        if (!DateOnly.TryParseExact(parts[1], "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var fecha))
            return null;

        if (!decimal.TryParse(parts[2], NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var monto))
            return null;

        return new DuplicateKey(cuenta, fecha.ToDateTime(TimeOnly.MinValue), monto);
    }

    private sealed record DuplicateKey(string Cuenta, DateTime Fecha, decimal Monto);
}

public record ValidationResult(bool IsValid, string? MotivoRechazo);
