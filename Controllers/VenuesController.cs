using Event_Planning_Platform.Data;
using Event_Planning_Platform.Models;
using Event_Planning_Platform.Models.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Event_Planning_Platform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public VenuesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
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
                Capacity = v.Capacity,
                CreatedBy = v.CreatedBy
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
                Capacity = venue.Capacity,
                CreatedBy = venue.CreatedBy
            };
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<VenueDto>> PostVenue(VenueDto dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await _userManager.GetUserAsync(User);
            var entity = new Venue
            {
                Name = dto.Name,
                Address = dto.Address,
                Capacity = dto.Capacity,
                CreatedBy = user?.Email
            };

            _context.Venues.Add(entity);
            await _context.SaveChangesAsync();

            var result = new VenueDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Address = entity.Address,
                Capacity = entity.Capacity,
                CreatedBy = entity.CreatedBy
            };

            return CreatedAtAction(nameof(GetVenue), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutVenue(int id, VenueDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "Route id does not match payload id." });
            }

            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var existing = await _context.Venues.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            var userRoles = await _userManager.GetRolesAsync(user!);
            var isAdmin = userRoles.Contains("Admin");

            if (!isAdmin && existing.CreatedBy != user?.Email)
            {
                return Forbid();
            }

            existing.Name = dto.Name;
            existing.Address = dto.Address;
            existing.Capacity = dto.Capacity;

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

            var user = await _userManager.GetUserAsync(User);
            var userRoles = await _userManager.GetRolesAsync(user!);
            var isAdmin = userRoles.Contains("Admin");

            if (!isAdmin && venue.CreatedBy != user?.Email)
            {
                return Forbid();
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
