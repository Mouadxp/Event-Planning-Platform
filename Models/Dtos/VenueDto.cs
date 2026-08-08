namespace Event_Planning_Platform.Models.Dtos
{
    public class VenueDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public int Capacity { get; set; }
    }
}
