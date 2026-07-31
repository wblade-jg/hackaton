namespace hackaton.Features.Files.DTOs;

public record ArchivoDisponibleResponse(string NombreArchivo, string Fecha, long TamanioBytes, int TotalFilas);
