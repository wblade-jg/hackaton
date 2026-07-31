using Microsoft.Extensions.Logging;

namespace hackaton.Infrastructure.Logging;

public class FileLoggerProvider : ILoggerProvider
{
    private readonly ILoggingStrategy _strategy;

    public FileLoggerProvider(ILoggingStrategy strategy)
    {
        _strategy = strategy;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return new FileLogger(categoryName, _strategy);
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);
    }
}

public class FileLogger : ILogger
{
    private readonly string _categoryName;
    private readonly ILoggingStrategy _strategy;

    public FileLogger(string categoryName, ILoggingStrategy strategy)
    {
        _categoryName = categoryName;
        _strategy = strategy;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

    public bool IsEnabled(LogLevel logLevel) => logLevel != LogLevel.None;

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel)) return;

        var message = formatter(state, exception);
        if (string.IsNullOrEmpty(message) && exception == null) return;

        // Simplify category name for cleaner logs (e.g., hackaton.Features.Files.CsvFileProcessor -> CsvFileProcessor)
        var source = _categoryName.Contains('.') 
            ? _categoryName[(_categoryName.LastIndexOf('.') + 1)..] 
            : _categoryName;

        _strategy.Log(logLevel, message, exception, source);
    }
}
