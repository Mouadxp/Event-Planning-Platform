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
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEvents()
        {
            var events = await _context.Events
                .Include(e => e.Venue)
                .ToListAsync();

            return events.Select(e => new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Start = e.Start,
                End = e.End,
                VenueId = e.VenueId,
                Venue = e.Venue == null ? null : new VenueDto
                {
                    Id = e.Venue.Id,
                    Name = e.Venue.Name,
                    Address = e.Venue.Address,
                    Capacity = e.Venue.Capacity
                }
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(int id)
        {
            var eventItem = await _context.Events
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventItem == null)
            {
                return NotFound();
            }

            return new EventDto
            {
                Id = eventItem.Id,
                Title = eventItem.Title,
                Description = eventItem.Description,
                Start = eventItem.Start,
                End = eventItem.End,
                VenueId = eventItem.VenueId,
                Venue = eventItem.Venue == null ? null : new VenueDto
                {
                    Id = eventItem.Venue.Id,
                    Name = eventItem.Venue.Name,
                    Address = eventItem.Venue.Address,
                    Capacity = eventItem.Venue.Capacity
                }
            };
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<EventDto>> PostEvent(EventDto dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var venueExists = await _context.Venues.AnyAsync(v => v.Id == dto.VenueId);
            if (!venueExists)
            {
                return BadRequest(new { message = "The selected venue does not exist." });
            }

            var entity = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                Start = dto.Start,
                End = dto.End,
                VenueId = dto.VenueId
            };

            _context.Events.Add(entity);
            await _context.SaveChangesAsync();

            var created = await _context.Events
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == entity.Id);

            var result = new EventDto
            {
                Id = created!.Id,
                Title = created.Title,
                Description = created.Description,
                Start = created.Start,
                End = created.End,
                VenueId = created.VenueId,
                Venue = created.Venue == null ? null : new VenueDto
                {
                    Id = created.Venue.Id,
                    Name = created.Venue.Name,
                    Address = created.Venue.Address,
                    Capacity = created.Venue.Capacity
                }
            };

            return CreatedAtAction(nameof(GetEvent), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutEvent(int id, EventDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "Route id does not match payload id." });
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var existing = await _context.Events.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var venueExists = await _context.Venues.AnyAsync(v => v.Id == dto.VenueId);
            if (!venueExists)
            {
                return BadRequest(new { message = "The selected venue does not exist." });
            }

            existing.Title = dto.Title;
            existing.Description = dto.Description;
            existing.Start = dto.Start;
            existing.End = dto.End;
            existing.VenueId = dto.VenueId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Events.AnyAsync(e => e.Id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
            {
                return NotFound();
            }

            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
