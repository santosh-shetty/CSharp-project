using Microsoft.EntityFrameworkCore;
using ProcureX.Models;

namespace ProcureX.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Company> Companies { get; set; }
    }
}
