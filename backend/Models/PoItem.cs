using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimplePOManager.Models
{
    public class PoItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PoId { get; set; }
        [ForeignKey("PoId")]
        public PurchaseOrder PurchaseOrder { get; set; }

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string ItemName { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal TotalPrice { get; set; } // Computed as Quantity * UnitPrice
    }
}
