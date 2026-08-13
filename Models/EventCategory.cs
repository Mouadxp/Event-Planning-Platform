using System.ComponentModel.DataAnnotations;

namespace Event_Planning_Platform.Models
{
    public class EventCategory
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
