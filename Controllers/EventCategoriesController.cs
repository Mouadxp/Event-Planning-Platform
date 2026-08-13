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
    public class EventCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventCategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventCategoryDto>>> GetCategories()
        {
            var categories = await _context.EventCategories
                .OrderBy(c => c.Name)
                .ToListAsync();

            return categories.Select(c => new EventCategoryDto
            {
                Id = c.Id,
                Name = c.Name
            }).ToList();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EventCategoryDto>> PostCategory(EventCategoryDto dto)
        {
            var name = dto.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                ModelState.AddModelError(nameof(dto.Name), "Category name is required.");
                return ValidationProblem(ModelState);
            }

            var exists = await _context.EventCategories
                .AnyAsync(c => c.Name.ToLower() == name.ToLower());
            if (exists)
            {
                return BadRequest(new { message = "A category with this name already exists." });
            }

            var entity = new EventCategory
            {
                Name = name
            };

            _context.EventCategories.Add(entity);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = entity.Id }, new EventCategoryDto
            {
                Id = entity.Id,
                Name = entity.Name
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutCategory(int id, EventCategoryDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest(new { message = "Route id does not match payload id." });
            }

            var name = dto.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                ModelState.AddModelError(nameof(dto.Name), "Category name is required.");
                return ValidationProblem(ModelState);
            }

            var existing = await _context.EventCategories.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var duplicate = await _context.EventCategories
                .AnyAsync(c => c.Id != id && c.Name.ToLower() == name.ToLower());
            if (duplicate)
            {
                return BadRequest(new { message = "A category with this name already exists." });
            }

            var previousName = existing.Name;
            existing.Name = name;

            var eventsToUpdate = await _context.Events
                .Where(e => e.Category == previousName)
                .ToListAsync();

            foreach (var eventItem in eventsToUpdate)
            {
                eventItem.Category = name;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var existing = await _context.EventCategories.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var isInUse = await _context.Events.AnyAsync(e => e.Category == existing.Name);
            if (isInUse)
            {
                return BadRequest(new { message = "This category is currently assigned to one or more events." });
            }

            _context.EventCategories.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
