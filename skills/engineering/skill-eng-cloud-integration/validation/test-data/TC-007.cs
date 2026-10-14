// TC-007: Unbounded cloud blob buffer loading in memory instead of streaming
using System;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;

public class BlobDownloader
{
    public async Task SaveBlobToDiskAsync(BlobClient client, string destinationPath)
    {
        // Defect CLD07: Downloads entire multi-gigabyte blob into memory array buffer causing OOM
        var response = await client.DownloadContentAsync();
        byte[] bytes = response.Value.Content.ToArray();
        await File.WriteAllBytesAsync(destinationPath, bytes);
    }
}

