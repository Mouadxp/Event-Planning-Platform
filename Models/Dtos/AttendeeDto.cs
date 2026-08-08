namespace Event_Planning_Platform.Models.Dtos
{
    public class AttendeeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public int EventId { get; set; }
        public EventDto? Event { get; set; }
        public bool IsAttending { get; set; }
    }
}
