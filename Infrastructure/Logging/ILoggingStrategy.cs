using Microsoft.Extensions.Logging;

namespace hackaton.Infrastructure.Logging;

public interface ILoggingStrategy
{
    void Log(LogLevel logLevel, string message, Exception? exception = null, string? source = null);
    Task LogAsync(LogLevel logLevel, string message, Exception? exception = null, string? source = null);
}
