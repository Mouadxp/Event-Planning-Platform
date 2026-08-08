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
    public class AttendeesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttendeesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttendeeDto>>> GetAttendees()
        {
            var attendees = await _context.Attendees
                .Include(a => a.Event)
                .ToListAsync();

            return attendees.Select(a => new AttendeeDto
            {
                Id = a.Id,
                Name = a.Name,
                Email = a.Email,
                EventId = a.EventId,
                IsAttending = a.IsAttending,
                Event = a.Event == null ? null : new EventDto
                {
                    Id = a.Event.Id,
                    Title = a.Event.Title,
                    Description = a.Event.Description,
                    Start = a.Event.Start,
                    End = a.Event.End,
                    VenueId = a.Event.VenueId
                }
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AttendeeDto>> GetAttendee(int id)
        {
            var attendee = await _context.Attendees
                .Include(a => a.Event)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendee == null)
            {
                return NotFound();
            }

            return new AttendeeDto
            {
                Id = attendee.Id,
                Name = attendee.Name,
                Email = attendee.Email,
                EventId = attendee.EventId,
                IsAttending = attendee.IsAttending,
                Event = attendee.Event == null ? null : new EventDto
                {
                    Id = attendee.Event.Id,
                    Title = attendee.Event.Title,
                    Description = attendee.Event.Description,
                    Start = attendee.Event.Start,
                    End = attendee.Event.End,
                    VenueId = attendee.Event.VenueId
                }
            };
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Attendee>> PostAttendee(Attendee attendee)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (string.IsNullOrWhiteSpace(attendee.Name))
            {
                return BadRequest(new { message = "Attendee name is required." });
            }

            var eventExists = await _context.Events.AnyAsync(e => e.Id == attendee.EventId);
            if (!eventExists)
            {
                return BadRequest(new { message = "The selected event does not exist." });
            }

            _context.Attendees.Add(attendee);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttendee), new { id = attendee.Id }, attendee);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutAttendee(int id, Attendee attendee)
        {
            if (id != attendee.Id)
            {
                return BadRequest(new { message = "Route id does not match payload id." });
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (string.IsNullOrWhiteSpace(attendee.Name))
            {
                return BadRequest(new { message = "Attendee name is required." });
            }

            var eventExists = await _context.Events.AnyAsync(e => e.Id == attendee.EventId);
            if (!eventExists)
            {
                return BadRequest(new { message = "The selected event does not exist." });
            }

            _context.Entry(attendee).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Attendees.AnyAsync(a => a.Id == id))
                {
                    return NotFound();
                }

                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteAttendee(int id)
        {
            var attendee = await _context.Attendees.FindAsync(id);
            if (attendee == null)
            {
                return NotFound();
            }

            _context.Attendees.Remove(attendee);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
