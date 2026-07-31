using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Text;

namespace hackaton.Infrastructure.Logging;

public class PlainTextFileLoggingStrategy : ILoggingStrategy, IDisposable
{
    private readonly FileLoggerOptions _options;
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private bool _disposed;

    public PlainTextFileLoggingStrategy(IOptions<FileLoggerOptions> options)
    {
        _options = options.Value;
    }

    public void Log(LogLevel logLevel, string message, Exception? exception = null, string? source = null)
    {
        if (logLevel < _options.MinimumLevel) return;

        var logLine = FormatLogEntry(logLevel, message, exception, source);
        var filePath = GetCurrentFilePath();

        _semaphore.Wait();
        try
        {
            EnsureDirectoryExists(filePath);
            File.AppendAllText(filePath, logLine, Encoding.UTF8);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task LogAsync(LogLevel logLevel, string message, Exception? exception = null, string? source = null)
    {
        if (logLevel < _options.MinimumLevel) return;

        var logLine = FormatLogEntry(logLevel, message, exception, source);
        var filePath = GetCurrentFilePath();

        await _semaphore.WaitAsync();
        try
        {
            EnsureDirectoryExists(filePath);
            await File.AppendAllTextAsync(filePath, logLine, Encoding.UTF8);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private string GetCurrentFilePath()
    {
        var dateStr = DateTime.Now.ToString("yyyyMMdd");
        var fileName = $"{_options.FilePrefix}_{dateStr}.log";
        return Path.Combine(_options.LogDirectory, fileName);
    }

    private static void EnsureDirectoryExists(string filePath)
    {
        var dir = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }
    }

    private static string FormatLogEntry(LogLevel level, string message, Exception? exception, string? source)
    {
        var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff");
        var levelStr = GetLevelShortString(level);
        var sourceStr = string.IsNullOrWhiteSpace(source) ? string.Empty : $" [{source}]";
        
        var sb = new StringBuilder();
        sb.Append($"[{timestamp}] [{levelStr}]{sourceStr} {message}{Environment.NewLine}");

        if (exception != null)
        {
            sb.Append($"    Exception: {exception.GetType().FullName}: {exception.Message}{Environment.NewLine}");
            if (!string.IsNullOrEmpty(exception.StackTrace))
            {
                sb.Append($"    StackTrace:{Environment.NewLine}{exception.StackTrace}{Environment.NewLine}");
            }
        }

        return sb.ToString();
    }

    private static string GetLevelShortString(LogLevel level) => level switch
    {
        LogLevel.Trace => "TRACE",
        LogLevel.Debug => "DEBUG",
        LogLevel.Information => "INFO",
        LogLevel.Warning => "WARN",
        LogLevel.Error => "ERROR",
        LogLevel.Critical => "FATAL",
        _ => "LOG"
    };

    public void Dispose()
    {
        if (!_disposed)
        {
            _semaphore.Dispose();
            _disposed = true;
        }
    }
}
