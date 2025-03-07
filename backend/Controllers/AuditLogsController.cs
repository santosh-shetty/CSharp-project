using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;


[Route("api/auditlogs")]
[ApiController]
public class AuditLogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuditLogsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs()
    {
        return await _context.AuditLogs.ToListAsync();
    }
}
