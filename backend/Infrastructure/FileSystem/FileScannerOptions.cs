using System.ComponentModel.DataAnnotations;

namespace hackaton.Infrastructure.FileSystem;

public class FileScannerOptions
{
    public const string SectionName = "FileScanner";

    [Required]
    public string InputDirectory { get; set; } = string.Empty;
}
