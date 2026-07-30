using hackaton.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;

namespace hackaton.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ArchivoControl> ArchivoControls => Set<ArchivoControl>();

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
    }
}
