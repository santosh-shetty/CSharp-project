using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SimplePOManager.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PoId { get; set; }
        [ForeignKey("PoId")]
        public PurchaseOrder PurchaseOrder { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        [Required]
        [Column(TypeName = "varchar(20)")]
        public string PaymentMethod { get; set; } = "cash"; // Options: cash, bank_transfer, credit_card

        [Required]
        [Column(TypeName = "varchar(20)")]
        public string Status { get; set; } = "pending"; // Options: pending, paid, failed
    }
}
