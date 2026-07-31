using Microsoft.Extensions.Logging;

namespace hackaton.Infrastructure.Logging;

public class FileLoggerOptions
{
    public const string SectionName = "Logging:File";

    public string LogDirectory { get; set; } = "logs";
    public string FilePrefix { get; set; } = "app";
    public LogLevel MinimumLevel { get; set; } = LogLevel.Information;
}
