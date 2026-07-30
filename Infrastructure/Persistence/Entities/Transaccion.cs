using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace hackaton.Infrastructure.Persistence.Entities;

public class Transaccion
{
    public int Id { get; set; }

    public int ArchivoControlId { get; set; }

    [MaxLength(10)]
    public string Cuenta { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Monto { get; set; }

    public DateTime Fecha { get; set; }

    [MaxLength(20)]
    public string Estado { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? MotivoRechazo { get; set; }

    public ArchivoControl ArchivoControl { get; set; } = null!;
}
