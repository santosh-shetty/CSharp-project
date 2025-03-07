using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;
using System.ComponentModel.DataAnnotations;


[Route("api/suppliers")]
[ApiController]
public class SuppliersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SuppliersController(ApplicationDbContext context)
    {
        _context = context;
    }

    public class SupplierRequest
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; }

        [StringLength(20)]
        public string Phone { get; set; }

        public string Address { get; set; }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Supplier>>> GetSuppliers()
    {
        try
        {
            return await _context.Suppliers
                .OrderBy(s => s.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving suppliers" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Supplier>> GetSupplier(int id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null) return NotFound();
        return supplier;
    }

    [HttpPost]
    public async Task<ActionResult<Supplier>> CreateSupplier(SupplierRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if supplier with same email exists
            if (await _context.Suppliers.AnyAsync(s => s.Email == request.Email))
            {
                return BadRequest(new { message = "A supplier with this email already exists" });
            }

            var supplier = new Supplier
            {
                Name = request.Name,
                Email = request.Email,
                Phone = request.Phone,
                Address = request.Address
            };

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the supplier" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupplier(int id, SupplierRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound(new { message = "Supplier not found" });
            }

            // Check if email is being changed and if new email already exists
            if (supplier.Email != request.Email && 
                await _context.Suppliers.AnyAsync(s => s.Email == request.Email))
            {
                return BadRequest(new { message = "A supplier with this email already exists" });
            }

            supplier.Name = request.Name;
            supplier.Email = request.Email;
            supplier.Phone = request.Phone;
            supplier.Address = request.Address;

            await _context.SaveChangesAsync();
            return Ok(supplier);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the supplier" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null)
            {
                return NotFound(new { message = "Supplier not found" });
            }

            // Check if supplier has any purchase orders
            var hasPurchaseOrders = await _context.PurchaseOrders
                .AnyAsync(po => po.SupplierId == id);

            if (hasPurchaseOrders)
            {
                return BadRequest(new { message = "Cannot delete supplier with existing purchase orders" });
            }

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Supplier deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the supplier" });
        }
    }
}
