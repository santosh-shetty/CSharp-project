using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using SimplePOManager.Data;
using System.Security.Cryptography;
using System.Text;
using System.ComponentModel.DataAnnotations;


namespace SimplePOManager.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Username, u.Email })
                .ToListAsync();
            return users;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            
            return new { user.Id, user.Username, user.Email };
        }

        public class RegisterUserRequest
        {
            [Required]
            public string Username { get; set; }

            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            [MinLength(6)]
            public string Password { get; set; }
        }

        public class LoginRequest
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; }

            [Required]
            public string Password { get; set; }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<object>> Login(LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new { message = "Invalid email or password" });
            }

            var hashedPassword = HashPassword(request.Password);
            if (user.PasswordHash != hashedPassword)
            {
                return BadRequest(new { message = "Invalid email or password" });
            }

            // Return user data without password hash
            return new
            {
                user.Id,
                user.Username,
                user.Email
            };
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(RegisterUserRequest request)
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Check if username already exists
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Username already taken" });
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Don't return the password hash in the response
            var userResponse = new
            {
                user.Id,
                user.Username,
                user.Email
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userResponse);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, User user)
        {
            if (id != user.Id) return BadRequest();

            _context.Entry(user).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
