namespace hackaton.Common.Validation;

public static class RechazoMotivos
{
    public const string MontoNoNumerico = "El monto debe ser un valor numérico válido.";
    public const string MontoNoPositivo = "El monto debe ser un valor monetario positivo.";
    public const string CuentaInvalida = "La cuenta debe tener exactamente 10 dígitos numéricos.";
    public const string FechaFormatoInvalido = "La fecha debe estar en formato dd/MM/yyyy.";
    public const string FechaInvalida = "La fecha no es una fecha válida.";
    public const string Duplicado = "Ya existe una transacción con la misma cuenta, fecha y monto.";

    public static bool EsMotivoDeMonto(string? motivo) =>
        motivo is MontoNoNumerico or MontoNoPositivo;
}
