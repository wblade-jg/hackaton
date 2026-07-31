using hackaton.Infrastructure.Persistence.Entities;

namespace hackaton.Features.Files;

public record ArchivoProcesadoResponse(
    int Id,
    string NombreArchivo,
    DateTime FechaProceso,
    string Estado,
    int TotalRegistros,
    int Procesados,
    int Rechazados)
{
    public static ArchivoProcesadoResponse From(ArchivoProcesado archivo) =>
        new(archivo.Id, archivo.NombreArchivo, archivo.FechaProceso, archivo.Estado.ToString(),
            archivo.TotalRegistros, archivo.Procesados, archivo.Rechazados);
}
