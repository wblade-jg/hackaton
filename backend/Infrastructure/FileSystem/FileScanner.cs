using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace hackaton.Infrastructure.FileSystem;

public partial class FileScanner : IFileScanner
{
    private static readonly Regex FilePattern = FileRegex();

    private readonly string _inputDirectory;

    public FileScanner(IOptions<FileScannerOptions> options)
    {
        _inputDirectory = options.Value.InputDirectory;
    }

    public IEnumerable<FileEntry> GetMatchingFiles()
    {
        if (!Directory.Exists(_inputDirectory))
            throw new DirectoryNotFoundException(
                $"El directorio de entrada '{_inputDirectory}' no existe.");

        return Directory
            .EnumerateFiles(_inputDirectory)
            .Select(Path.GetFileName)
            .Select(name => name is not null ? TryParseFileEntry(name) : null)
            .Where(entry => entry is not null)
            .Cast<FileEntry>();
    }

    private static FileEntry? TryParseFileEntry(string fileName)
    {
        var match = FilePattern.Match(fileName);
        if (!match.Success) return null;

        var year = match.Groups[3].Value;
        var month = match.Groups[2].Value;
        var day = match.Groups[1].Value;

        if (!DateOnly.TryParseExact($"{year}-{month}-{day}", "yyyy-MM-dd",
                CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return null;

        return new FileEntry(fileName, date);
    }

    [GeneratedRegex(@"^transactions_(\d{2})(\d{2})(\d{4})\.csv$", RegexOptions.IgnoreCase | RegexOptions.Compiled)]
    private static partial Regex FileRegex();
}
