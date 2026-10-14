// TC-003: Partial Multi-Resource Acquisition Failure Leaking First Resource (RES03)
using System.IO;
using System.Net.Sockets;

namespace Lifecycle.Validation;

public class NetworkFileTransmitter
{
    public void Transmit(string filePath, string host, int port)
    {
        // Resource 1 Acquired
        var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);

        // RES03 Defect: If Socket creation throws (e.g. SocketException), fileStream remains unclosed
        var tcpClient = new TcpClient(host, port);

        try
        {
            fileStream.CopyTo(tcpClient.GetStream());
        }
        finally
        {
            fileStream.Dispose();
            tcpClient.Dispose();
        }
    }
}

