using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace hackaton.Infrastructure.Persistence.Entities;

public class Transaccion
{
    public int Id { get; set; }

    public int ArchivoProcesadoId { get; set; }

    [MaxLength(10)]
    public string Cuenta { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Monto { get; set; }

    public DateTime Fecha { get; set; }

    public TransaccionEstado Estado { get; private set; }

    [MaxLength(500)]
    public string? MotivoRechazo { get; private set; }

    public ArchivoProcesado ArchivoProcesado { get; set; } = null!;

    /// <summary>
    /// Marca la transacción como aprobada. Limpia cualquier motivo de rechazo previo.
    /// </summary>
    public void Aprobar()
    {
        Estado = TransaccionEstado.PROCESADO;
        MotivoRechazo = null;
    }

    /// <summary>
    /// Marca la transacción como rechazada con su motivo de rechazo.
    /// </summary>
    /// <param name="motivo">Descripción legible del motivo del rechazo.</param>
    public void Rechazar(string motivo)
    {
        if (string.IsNullOrWhiteSpace(motivo))
            throw new ArgumentException("El motivo de rechazo no puede estar vacío.", nameof(motivo));

        Estado = TransaccionEstado.RECHAZADA;
        MotivoRechazo = motivo;
    }

    /// <summary>
    /// Indica si la transacción puede ser modificada (solo las rechazadas son editables).
    /// </summary>
    public bool EsModificable => Estado == TransaccionEstado.RECHAZADA;
}
