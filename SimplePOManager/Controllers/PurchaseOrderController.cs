using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;

namespace SimplePOManager.Controllers
{
    [ApiController]
    [Route("api/purchaseorders")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchaseOrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPurchaseOrders() =>
            Ok(await _context.PurchaseOrders.Include(po => po.Items).ToListAsync());

        [HttpPost]
        public async Task<IActionResult> AddPurchaseOrder([FromBody] PurchaseOrder po)
        {
            _context.PurchaseOrders.Add(po);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPurchaseOrders), new { id = po.Id }, po);
        }
    }
}
