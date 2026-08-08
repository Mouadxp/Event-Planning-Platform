using System.ComponentModel.DataAnnotations;

namespace Event_Planning_Platform.Models
{
    public class Attendee
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; }

        public int EventId { get; set; }
        public Event? Event { get; set; }

        public bool IsAttending { get; set; } = true;
    }
}
