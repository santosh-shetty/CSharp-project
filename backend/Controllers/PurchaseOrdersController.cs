using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

[Route("api/purchaseorders")]
[ApiController]
public class PurchaseOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PurchaseOrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class PoItemRequest
    {
        [Required]
        [StringLength(255)]
        public string ItemName { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal UnitPrice { get; set; }
    }

    public class PurchaseOrderRequest
    {
        [Required]
        public int SupplierId { get; set; }

        [Required]
        public List<PoItemRequest> Items { get; set; }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetPurchaseOrders()
    {
        try
        {
            var orders = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PoItems)
                .Include(po => po.User)
                .OrderByDescending(po => po.OrderDate)
                .Select(po => new
                {
                    po.Id,
                    po.PoNumber,
                    po.OrderDate,
                    po.Status,
                    po.TotalAmount,
                    Supplier = new { po.Supplier.Id, po.Supplier.Name, po.Supplier.Email },
                    CreatedBy = po.User.Username,
                    ItemCount = po.PoItems.Count
                })
                .ToListAsync();

            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving purchase orders" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetPurchaseOrder(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PoItems)
                .Include(po => po.User)
                .FirstOrDefaultAsync(po => po.Id == id);

            if (purchaseOrder == null)
                return NotFound(new { message = "Purchase order not found" });

            var result = new
            {
                purchaseOrder.Id,
                purchaseOrder.PoNumber,
                purchaseOrder.OrderDate,
                purchaseOrder.Status,
                purchaseOrder.TotalAmount,
                Supplier = new { purchaseOrder.Supplier.Id, purchaseOrder.Supplier.Name, purchaseOrder.Supplier.Email },
                CreatedBy = purchaseOrder.User.Username,
                Items = purchaseOrder.PoItems.Select(item => new
                {
                    item.Id,
                    item.ItemName,
                    item.Quantity,
                    item.UnitPrice,
                    item.TotalPrice
                })
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving the purchase order" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreatePurchaseOrder(PurchaseOrderRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Validate supplier exists
            var supplier = await _context.Suppliers
                .Include(s => s.PurchaseOrders)
                .FirstOrDefaultAsync(s => s.Id == request.SupplierId);

            if (supplier == null)
                return BadRequest(new { message = "Invalid supplier ID" });

            // Get default user (temporary solution)
            var user = await _context.Users.FirstOrDefaultAsync();
            if (user == null)
                return BadRequest(new { message = "No default user found" });

            // Generate PO number (format: PO-YYYY-XXXX)
            var yearPrefix = $"PO-{DateTime.UtcNow.Year}-";
            var lastPoNumber = await _context.PurchaseOrders
                .Where(po => po.PoNumber.StartsWith(yearPrefix))
                .Select(po => po.PoNumber)
                .OrderByDescending(n => n)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastPoNumber != null)
            {
                var match = Regex.Match(lastPoNumber, @"\d+$");
                if (match.Success && int.TryParse(match.Value, out int lastSequence))
                    sequence = lastSequence + 1;
            }

            var poNumber = $"{yearPrefix}{sequence:D4}";

            // Calculate total amount
            decimal totalAmount = request.Items.Sum(item => item.Quantity * item.UnitPrice);

            // Create PO
            var purchaseOrder = new PurchaseOrder
            {
                PoNumber = poNumber,
                SupplierId = request.SupplierId,
                Supplier = supplier,
                UserId = user.Id,
                User = user,
                OrderDate = DateTime.UtcNow,
                Status = "pending",
                TotalAmount = totalAmount,
                Payments = new List<Payment>() // Initialize empty payments list
            };

            // Add items
            var poItems = request.Items.Select(item => new PoItem
            {
                ItemName = item.ItemName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice
            }).ToList();

            purchaseOrder.PoItems = poItems;

            _context.PurchaseOrders.Add(purchaseOrder);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Return created PO
            return CreatedAtAction(
                nameof(GetPurchaseOrder),
                new { id = purchaseOrder.Id },
                new { 
                    purchaseOrder.Id,
                    purchaseOrder.PoNumber,
                    purchaseOrder.OrderDate,
                    purchaseOrder.Status,
                    purchaseOrder.TotalAmount,
                    Supplier = new { supplier.Id, supplier.Name, supplier.Email },
                    Items = poItems.Select(item => new
                    {
                        item.Id,
                        item.ItemName,
                        item.Quantity,
                        item.UnitPrice,
                        item.TotalPrice
                    })
                }
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "An error occurred while creating the purchase order" });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdatePurchaseOrderStatus(int id, [FromBody] string status)
    {
        try
        {
            var validStatuses = new[] { "pending", "approved", "completed", "cancelled" };
            if (!validStatuses.Contains(status.ToLower()))
                return BadRequest(new { message = "Invalid status. Must be one of: pending, approved, completed, cancelled" });

            var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
            if (purchaseOrder == null)
                return NotFound(new { message = "Purchase order not found" });

            // Validate status transition
            if (purchaseOrder.Status == "cancelled")
                return BadRequest(new { message = "Cannot update status of a cancelled purchase order" });

            if (purchaseOrder.Status == "completed" && status.ToLower() != "cancelled")
                return BadRequest(new { message = "Completed purchase order can only be cancelled" });

            purchaseOrder.Status = status.ToLower();
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Purchase order status updated to {status}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the purchase order status" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchaseOrder(int id)
    {
        try
        {
            var purchaseOrder = await _context.PurchaseOrders
                .Include(po => po.Payments)
                .FirstOrDefaultAsync(po => po.Id == id);

            if (purchaseOrder == null)
                return NotFound(new { message = "Purchase order not found" });

            // Check if PO can be deleted
            if (purchaseOrder.Status != "pending")
                return BadRequest(new { message = "Only pending purchase orders can be deleted" });

            if (purchaseOrder.Payments != null && purchaseOrder.Payments.Any())
                return BadRequest(new { message = "Cannot delete purchase order with existing payments" });

            _context.PurchaseOrders.Remove(purchaseOrder);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Purchase order deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the purchase order" });
        }
    }
}
