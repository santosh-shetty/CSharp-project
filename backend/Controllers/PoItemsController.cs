using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;


[Route("api/poitems")]
[ApiController]
public class PoItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PoItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PoItem>>> GetPoItems()
    {
        return await _context.PoItems.ToListAsync();
    }
}
