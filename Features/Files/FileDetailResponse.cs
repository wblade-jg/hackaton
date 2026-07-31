namespace hackaton.Features.Files;

public record FileDetailResponse(
    int Id,
    string NombreArchivo,
    DateTime FechaProceso,
    string Estado,
    int TotalRegistros,
    int Procesados,
    int Rechazados,
    List<TransaccionDetailResponse> Transacciones);

public record TransaccionDetailResponse(
    int Id,
    string Cuenta,
    decimal Monto,
    DateTime Fecha,
    string Estado,
    string? MotivoRechazo,
    bool EsEditable);
