using hackaton.Common.Validation;
using hackaton.Features.Files.Services;
using hackaton.Infrastructure.FileSystem;
using hackaton.Infrastructure.Logging;
using hackaton.Infrastructure.Persistence;
using hackaton.Infrastructure.Routing;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddFileLogging(builder.Configuration);

builder.Services.Configure<FileScannerOptions>(
    builder.Configuration.GetSection(FileScannerOptions.SectionName));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddScoped<IFileScanner, FileScanner>();
builder.Services.AddScoped<TransactionValidator>();
builder.Services.AddScoped<CsvFileProcessor>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration["Cors:AllowedOrigins"]?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                      ?? new[] { "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173" };
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, ct) =>
    {
        document.Info.Title = "API de Procesamiento de Archivos";
        document.Info.Description = "Procesa archivos CSV de transacciones bancarias.";
        document.Info.Version = "v1";
        return Task.CompletedTask;
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
        options.WithTitle("API de Procesamiento de Archivos")
               .WithTheme(ScalarTheme.Moon));
}

app.MapEndpoints();

app.Run();
