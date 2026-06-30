namespace BaayuLok.API.Services;

public interface IFileUploadService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    bool Delete(string fileUrl);
}
