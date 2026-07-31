using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ArchivoProcesado> ArchivosProcesados => Set<ArchivoProcesado>();

    public DbSet<Transaccion> Transacciones => Set<Transaccion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ArchivoProcesado>(entity =>
        {
            entity.ToTable("ArchivoControl");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NombreArchivo).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.NombreArchivo).IsUnique();
            entity.Property(e => e.Estado)
                  .HasMaxLength(20)
                  .IsRequired()
                  .HasConversion<string>();
        });

        modelBuilder.Entity<Transaccion>(entity =>
        {
            entity.ToTable("Transaccion");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Cuenta).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Monto).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Estado)
                  .HasMaxLength(20)
                  .IsRequired()
                  .HasConversion<string>();
            entity.Property(e => e.MotivoRechazo).HasMaxLength(500);
            entity.HasOne(t => t.ArchivoProcesado)
                  .WithMany(a => a.Transacciones)
                  .HasForeignKey(t => t.ArchivoProcesadoId);
            entity.HasIndex(e => e.ArchivoProcesadoId);
        });
    }
}
