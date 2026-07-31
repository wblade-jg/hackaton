namespace hackaton.Infrastructure.FileSystem;

public interface IFileScanner
{
    IEnumerable<FileEntry> GetMatchingFiles();
}
