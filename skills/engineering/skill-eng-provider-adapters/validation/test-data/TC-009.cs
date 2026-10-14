// TC-009: Fragile Enum Deserialization Crashing on Unrecognized Provider Values (ADP09)
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CodeReview.Adapters;

public enum WebhookEventType
{
    PullRequestCreated,
    PullRequestUpdated
}

public class WebhookPayload
{
    // ADP09 Defect: Strict enum deserializer without fallback value crashes when provider adds new event types
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public WebhookEventType EventType { get; set; }
}

