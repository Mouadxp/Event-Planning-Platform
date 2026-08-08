using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Event_Planning_Platform.Models
{
    public class Venue
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Address { get; set; }

        public int Capacity { get; set; }

        [JsonIgnore]
        public List<Event> Events { get; set; } = new();
    }
}
