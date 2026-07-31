using hackaton.Common.Validation;
using hackaton.Features.Files;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Routing;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FileScannerOptions>(
    builder.Configuration.GetSection(FileScannerOptions.SectionName));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddScoped<IFileScanner, FileScanner>();
builder.Services.AddScoped<TransactionValidator>();
builder.Services.AddScoped<CsvFileProcessor>();

var app = builder.Build();

app.MapEndpoints();

app.Run();
