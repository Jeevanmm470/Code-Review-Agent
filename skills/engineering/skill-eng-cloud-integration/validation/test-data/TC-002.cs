// TC-002: Hardcoded database password in appsettings.json instead of Azure Key Vault
using System;
using Microsoft.Extensions.Configuration;

public class DatabaseConfig
{
    private readonly IConfiguration _configuration;

    public DatabaseConfig(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GetConnectionString()
    {
        // Defect CLD02: Reads plaintext secret stored in appsettings config rather than Key Vault
        return _configuration["Database:StaticAdminPassword"];
    }
}

