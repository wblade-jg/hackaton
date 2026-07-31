namespace hackaton.Features.Transactions.DTOs;

public record TransaccionResponse(
    int Id,
    string Cuenta,
    decimal Monto,
    DateTime Fecha,
    string Estado,
    string? MotivoRechazo,
    bool EsEditable);
