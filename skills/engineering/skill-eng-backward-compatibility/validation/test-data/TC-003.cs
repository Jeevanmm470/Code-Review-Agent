// TC-003: Removing Field from Public Response DTO (BWC03)
namespace Compat.Validation;

public class UserResponseDto
{
    public string Id { get; set; }
    public string FullName { get; set; }

    // BWC03 Defect: Removed 'public string Email { get; set; }' which downstream consumers rely on
}

