using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Mapping;
using hackaton.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FileScannerOptions>(
    builder.Configuration.GetSection(FileScannerOptions.SectionName));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddScoped<IFileScanner, FileScanner>();


var app = builder.Build();

app.MapEndpoints();

app.Run();
