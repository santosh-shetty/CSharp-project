using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // ✅ Add this line

namespace SimplePOManager.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")] 
        public string Username { get; set; }

        [Required]
        public string PasswordHash { get; set; }
    }
}
