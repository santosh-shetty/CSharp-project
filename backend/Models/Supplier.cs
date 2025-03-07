using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimplePOManager.Models
{
    public class Supplier
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string Name { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string Email { get; set; }

        [Column(TypeName = "varchar(20)")]
        public string Phone { get; set; }

        public string Address { get; set; }

        public ICollection<PurchaseOrder> PurchaseOrders { get; set; } // Relation with PurchaseOrders
    }
}
