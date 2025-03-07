using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimplePOManager.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public string Action { get; set; }

        [Required]
        public DateTime ActionTime { get; set; } = DateTime.UtcNow;
    }
}
