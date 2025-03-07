using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;


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
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
    {
        return await _context.Payments.ToListAsync();
    }
}
