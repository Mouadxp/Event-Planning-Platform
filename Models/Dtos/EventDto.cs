namespace Event_Planning_Platform.Models.Dtos
{
    public class EventDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public int VenueId { get; set; }
        public VenueDto? Venue { get; set; }
    }
}
