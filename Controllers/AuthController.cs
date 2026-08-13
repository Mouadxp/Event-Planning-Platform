using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Event_Planning_Platform.Models;
using Event_Planning_Platform.Models.Dtos;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace Event_Planning_Platform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private const string AdminRoleName = "Admin";

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            await EnsureAdminRoleExistsAsync();
            var shouldMakeAdmin = !(await _userManager.GetUsersInRoleAsync(AdminRoleName)).Any();

            var user = new ApplicationUser { UserName = request.Email, Email = request.Email };
            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            if (shouldMakeAdmin)
            {
                var addToRoleResult = await _userManager.AddToRoleAsync(user, AdminRoleName);
                if (!addToRoleResult.Succeeded)
                {
                    return BadRequest(new { errors = addToRoleResult.Errors.Select(e => e.Description) });
                }
            }

            var token = await GenerateJwtTokenAsync(user);
            return Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            var token = await GenerateJwtTokenAsync(user);
            return Ok(new { token });
        }

        [HttpPost("logout")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Logout()
        {
            // For JWT, logout is primarily a client-side operation (discard the token).
            // We still call SignOutAsync to clear any server-side state (if used).
            await _signInManager.SignOutAsync();
            return NoContent();
        }

        private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
        {
            var signingKey = _configuration["Jwt:Key"] ?? "development-secret-key-please-change-me";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, user.Id)
            };

            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "EventPlanningPlatform",
                audience: _configuration["Jwt:Audience"] ?? "EventPlanningPlatformUsers",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task EnsureAdminRoleExistsAsync()
        {
            if (!await _roleManager.RoleExistsAsync(AdminRoleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(AdminRoleName));
            }
        }
    }
}
