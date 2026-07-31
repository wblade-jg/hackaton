using System.ComponentModel.DataAnnotations;

namespace hackaton.Infrastructure.Persistence.Entities;

public class ArchivoProcesado
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string NombreArchivo { get; set; } = string.Empty;

    public DateTime FechaProceso { get; set; }

    public ArchivoEstado Estado { get; private set; }

    public int TotalRegistros { get; set; }

    public int Procesados { get; private set; }

    public int Rechazados { get; private set; }

    public List<Transaccion> Transacciones { get; set; } = [];

    /// <summary>
    /// Registra que una transacción previamente rechazada fue aprobada.
    /// Actualiza los contadores y recalcula el estado del archivo.
    /// </summary>
    public void RegistrarAprobada()
    {
        if (Rechazados <= 0)
            throw new InvalidOperationException("No hay transacciones rechazadas que aprobar en este archivo.");

        Procesados++;
        Rechazados--;
        RecalcularEstado();
    }

    /// <summary>
    /// Registra que una transacción fue rechazada durante el procesamiento.
    /// Actualiza los contadores y recalcula el estado del archivo.
    /// </summary>
    public void RegistrarRechazada()
    {
        Rechazados++;
        if (Procesados > 0) Procesados--;
        RecalcularEstado();
    }

    /// <summary>
    /// Recalcula el estado del archivo en función de sus contadores actuales.
    /// PROCESADO: todas las transacciones aprobadas.
    /// CON_ERRORES: al menos una rechazada.
    /// </summary>
    private void RecalcularEstado()
    {
        Estado = Rechazados == 0 ? ArchivoEstado.PROCESADO : ArchivoEstado.CON_ERRORES;
    }
}
