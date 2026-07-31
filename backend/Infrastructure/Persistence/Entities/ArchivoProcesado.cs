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

    public void RegistrarAprobada()
    {
        if (Rechazados <= 0)
            throw new InvalidOperationException("No hay transacciones rechazadas que aprobar en este archivo.");

        Procesados++;
        Rechazados--;
        RecalcularEstado();
    }

    public void RegistrarRechazada()
    {
        Rechazados++;
        if (Procesados > 0) Procesados--;
        RecalcularEstado();
    }

    public void RegistrarNuevaAprobada()
    {
        Procesados++;
        RecalcularEstado();
    }

    public void RegistrarNuevaRechazada()
    {
        Rechazados++;
        RecalcularEstado();
    }

    public void MarcarFallido()
    {
        TotalRegistros = 0;
        Procesados = 0;
        Rechazados = 0;
        Estado = ArchivoEstado.FALLIDO;
    }

    private void RecalcularEstado()
    {
        Estado = Rechazados == 0 ? ArchivoEstado.PROCESADO : ArchivoEstado.CON_ERRORES;
    }
}
