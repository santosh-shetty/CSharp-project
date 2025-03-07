using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;


[Route("api/payments")]
[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetPayments()
    {
        try
        {
            var payments = await _context.Payments
                .Include(p => p.PurchaseOrder)
                    .ThenInclude(po => po.Supplier)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new
                {
                    p.Id,
                    p.Amount,
                    p.PaymentDate,
                    p.PaymentMethod,
                    p.Status,
                    PurchaseOrder = new
                    {
                        p.PurchaseOrder.Id,
                        p.PurchaseOrder.PoNumber,
                        Supplier = new
                        {
                            p.PurchaseOrder.Supplier.Id,
                            p.PurchaseOrder.Supplier.Name
                        }
                    }
                })
                .ToListAsync();

            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving payments" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetPayment(int id)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.PurchaseOrder)
                    .ThenInclude(po => po.Supplier)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
                return NotFound(new { message = "Payment not found" });

            return Ok(new
            {
                payment.Id,
                payment.Amount,
                payment.PaymentDate,
                payment.PaymentMethod,
                payment.Status,
                PurchaseOrder = new
                {
                    payment.PurchaseOrder.Id,
                    payment.PurchaseOrder.PoNumber,
                    payment.PurchaseOrder.TotalAmount,
                    Supplier = new
                    {
                        payment.PurchaseOrder.Supplier.Id,
                        payment.PurchaseOrder.Supplier.Name
                    }
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the payment" });
        }
    }

    public class PaymentRequest
    {
        [Required]
        public int PoId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        [RegularExpression("^(cash|bank_transfer|credit_card)$", ErrorMessage = "Invalid payment method")]
        public string PaymentMethod { get; set; }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreatePayment(PaymentRequest request)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .FirstOrDefaultAsync(po => po.Id == request.PoId);

            if (purchaseOrder == null)
                return NotFound(new { message = "Purchase order not found" });

            // Validate payment amount against remaining balance
            var existingPayments = await _context.Payments
                .Where(p => p.PoId == request.PoId && p.Status == "paid")
                .SumAsync(p => p.Amount);

            var remainingBalance = purchaseOrder.TotalAmount - existingPayments;

            if (request.Amount > remainingBalance)
                return BadRequest(new { message = $"Payment amount exceeds remaining balance of {remainingBalance:C}" });

            var payment = new Payment
            {
                PoId = request.PoId,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                PaymentDate = DateTime.UtcNow,
                Status = "pending"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, new
            {
                payment.Id,
                payment.Amount,
                payment.PaymentDate,
                payment.PaymentMethod,
                payment.Status,
                PurchaseOrder = new
                {
                    purchaseOrder.Id,
                    purchaseOrder.PoNumber,
                    Supplier = new
                    {
                        purchaseOrder.Supplier.Id,
                        purchaseOrder.Supplier.Name
                    }
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the payment" });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<object>> UpdatePaymentStatus(int id, [FromBody] string status)
    {
        if (status != "pending" && status != "paid" && status != "failed")
            return BadRequest(new { message = "Invalid status" });

        try
        {
            var payment = await _context.Payments
                .Include(p => p.PurchaseOrder)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (payment == null)
                return NotFound(new { message = "Payment not found" });

            payment.Status = status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Payment status updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating payment status" });
        }
    }
}
