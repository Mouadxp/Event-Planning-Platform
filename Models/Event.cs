using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Event_Planning_Platform.Models
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Category { get; set; }

        public string? Description { get; set; }

        public DateTime Start { get; set; }
        public DateTime End { get; set; }

        public int VenueId { get; set; }

        [JsonIgnore]
        public Venue? Venue { get; set; }

        [JsonIgnore]
        public List<Attendee> Attendees { get; set; } = new();
    }
}
