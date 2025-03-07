using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;

[Route("api/purchaseorders")]
[ApiController]
public class PurchaseOrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PurchaseOrdersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PurchaseOrder>>> GetPurchaseOrders()
    {
        return await _context.PurchaseOrders.Include(po => po.Supplier).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PurchaseOrder>> GetPurchaseOrder(int id)
    {
        var purchaseOrder = await _context.PurchaseOrders
            .Include(po => po.Supplier)
            .FirstOrDefaultAsync(po => po.Id == id);

        if (purchaseOrder == null) return NotFound();
        return purchaseOrder;
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseOrder>> CreatePurchaseOrder(PurchaseOrder purchaseOrder)
    {
        _context.PurchaseOrders.Add(purchaseOrder);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPurchaseOrder), new { id = purchaseOrder.Id }, purchaseOrder);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePurchaseOrder(int id, PurchaseOrder purchaseOrder)
    {
        if (id != purchaseOrder.Id) return BadRequest();

        _context.Entry(purchaseOrder).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePurchaseOrder(int id)
    {
        var purchaseOrder = await _context.PurchaseOrders.FindAsync(id);
        if (purchaseOrder == null) return NotFound();

        _context.PurchaseOrders.Remove(purchaseOrder);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
