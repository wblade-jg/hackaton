using Microsoft.Extensions.Logging;

namespace hackaton.Infrastructure.Logging;

public class ConsoleLoggingStrategy : ILoggingStrategy
{
    public void Log(LogLevel logLevel, string message, Exception? exception = null, string? source = null)
    {
        var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
        var sourceStr = string.IsNullOrWhiteSpace(source) ? string.Empty : $"[{source}] ";
        var output = $"[{timestamp}] [{logLevel.ToString().ToUpper()}] {sourceStr}{message}";

        if (logLevel >= LogLevel.Error)
        {
            Console.Error.WriteLine(output);
            if (exception != null) Console.Error.WriteLine(exception);
        }
        else
        {
            Console.WriteLine(output);
            if (exception != null) Console.WriteLine(exception);
        }
    }

    public Task LogAsync(LogLevel logLevel, string message, Exception? exception = null, string? source = null)
    {
        Log(logLevel, message, exception, source);
        return Task.CompletedTask;
    }
}
