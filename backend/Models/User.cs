using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        [Column(TypeName = "varchar(255)")] 
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public ICollection<PurchaseOrder> PurchaseOrders { get; set; } // Relation with PurchaseOrders
    }
}
