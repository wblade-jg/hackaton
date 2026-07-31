using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace hackaton.Infrastructure.Logging;

public static class LoggingExtensions
{
    public static IServiceCollection AddFileLogging(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FileLoggerOptions>(configuration.GetSection(FileLoggerOptions.SectionName));
        
        // Register default Strategy (PlainTextFileLoggingStrategy)
        services.AddSingleton<ILoggingStrategy, PlainTextFileLoggingStrategy>();

        // Register custom LoggerProvider
        services.AddSingleton<ILoggerProvider, FileLoggerProvider>();

        return services;
    }
}
