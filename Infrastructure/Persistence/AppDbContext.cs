using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ArchivoControl> ArchivoControls => Set<ArchivoControl>();

    public DbSet<Transaccion> Transacciones => Set<Transaccion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ArchivoControl>(entity =>
        {
            entity.ToTable("ArchivoControl");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.NombreArchivo).HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.NombreArchivo).IsUnique();
            entity.Property(e => e.Estado).HasMaxLength(20).IsRequired();
        });

        modelBuilder.Entity<Transaccion>(entity =>
        {
            entity.ToTable("Transaccion");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Cuenta).HasMaxLength(10).IsRequired();
            entity.Property(e => e.Monto).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Estado).HasMaxLength(20).IsRequired();
            entity.Property(e => e.MotivoRechazo).HasMaxLength(500);
            entity.HasOne(t => t.ArchivoControl)
                  .WithMany(a => a.Transacciones)
                  .HasForeignKey(t => t.ArchivoControlId);
            entity.HasIndex(e => e.ArchivoControlId);
        });
    }
}
