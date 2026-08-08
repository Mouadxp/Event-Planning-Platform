using Event_Planning_Platform.Data;
using Event_Planning_Platform.Models;
using Event_Planning_Platform.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Event_Planning_Platform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VenuesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetVenues()
        {
            var venues = await _context.Venues.ToListAsync();
            return venues.Select(v => new VenueDto
            {
                Id = v.Id,
                Name = v.Name,
                Address = v.Address,
                Capacity = v.Capacity
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VenueDto>> GetVenue(int id)
        {
            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == id);
            if (venue == null)
            {
                return NotFound();
            }

            return new VenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                Capacity = venue.Capacity
            };
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Venue>> PostVenue(Venue venue)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (string.IsNullOrWhiteSpace(venue.Name))
            {
                return BadRequest(new { message = "Venue name is required." });
            }

            if (venue.Capacity <= 0)
            {
                return BadRequest(new { message = "Capacity must be greater than zero." });
            }

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVenue), new { id = venue.Id }, venue);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutVenue(int id, Venue venue)
        {
            if (id != venue.Id)
            {
                return BadRequest(new { message = "Route id does not match payload id." });
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (string.IsNullOrWhiteSpace(venue.Name))
            {
                return BadRequest(new { message = "Venue name is required." });
            }

            if (venue.Capacity <= 0)
            {
                return BadRequest(new { message = "Capacity must be greater than zero." });
            }

            _context.Entry(venue).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Venues.AnyAsync(v => v.Id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteVenue(int id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null)
            {
                return NotFound();
            }

            var hasEvents = await _context.Events.AnyAsync(e => e.VenueId == id);
            if (hasEvents)
            {
                return BadRequest(new { message = "This venue is currently assigned to one or more events." });
            }

            _context.Venues.Remove(venue);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
