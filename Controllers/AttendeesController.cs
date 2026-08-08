using Event_Planning_Platform.Data;
using Event_Planning_Platform.Models;
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
        public async Task<ActionResult<IEnumerable<Attendee>>> GetAttendees()
        {
            return await _context.Attendees
                .Include(a => a.Event)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Attendee>> GetAttendee(int id)
        {
            var attendee = await _context.Attendees
                .Include(a => a.Event)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attendee == null)
            {
                return NotFound();
            }

            return attendee;
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
