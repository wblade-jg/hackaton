namespace hackaton.Features.Files.DTOs;

public record FileDetailResponse(
    int Id,
    string NombreArchivo,
    DateTime FechaProceso,
    string Estado,
    int TotalRegistros,
    int Procesados,
    int Rechazados,
    List<TransaccionDetailResponse> Transacciones,
    string? NextCursor,
    bool HasNextPage,
    int PageSize);

public record TransaccionDetailResponse(
    int Id,
    string Cuenta,
    decimal Monto,
    DateTime Fecha,
    string Estado,
    string? MotivoRechazo,
    bool EsEditable);
