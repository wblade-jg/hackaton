using System.ComponentModel.DataAnnotations;

namespace hackaton.Infrastructure.Persistence.Entities;

public class ArchivoControl
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string NombreArchivo { get; set; } = string.Empty;

    public DateTime FechaProceso { get; set; }

    [Required]
    [MaxLength(20)]
    public string Estado { get; set; } = string.Empty;

    public int TotalRegistros { get; set; }

    public int Procesados { get; set; }

    public int Rechazados { get; set; }
}
