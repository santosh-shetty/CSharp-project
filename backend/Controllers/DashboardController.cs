using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SimplePOManager.Data;
using SimplePOManager.Models;

namespace SimplePOManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public class DashboardStats
        {
            public int TotalSuppliers { get; set; }
            public int TotalPurchaseOrders { get; set; }
            public int PendingPurchaseOrders { get; set; }
            public decimal TotalSpent { get; set; }
            public decimal PendingPayments { get; set; }
            public List<RecentActivity> RecentActivities { get; set; }
            public List<MonthlySpending> MonthlySpending { get; set; }
            public List<TopSupplier> TopSuppliers { get; set; }
        }

        public class RecentActivity
        {
            public string Type { get; set; } // "payment" or "purchase_order"
            public string Description { get; set; }
            public DateTime Date { get; set; }
            public string Status { get; set; }
            public decimal Amount { get; set; }
        }

        public class MonthlySpending
        {
            public string Month { get; set; }
            public decimal Amount { get; set; }
        }

        public class TopSupplier
        {
            public string Name { get; set; }
            public decimal TotalAmount { get; set; }
            public int OrderCount { get; set; }
        }

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardStats>> GetDashboardStats()
        {
            try
            {
                var now = DateTime.UtcNow;
                var startOfYear = new DateTime(now.Year, 1, 1);

                // Basic stats
                var totalSuppliers = await _context.Suppliers.CountAsync();
                var totalPOs = await _context.PurchaseOrders.CountAsync();
                var pendingPOs = await _context.PurchaseOrders.CountAsync(po => po.Status == "pending");
                
                var totalSpent = await _context.Payments
                    .Where(p => p.Status == "paid")
                    .SumAsync(p => p.Amount);

                var pendingPayments = await _context.PurchaseOrders
                    .Where(po => po.Status != "cancelled")
                    .SumAsync(po => po.TotalAmount) - totalSpent;

                // Recent activities
                var recentPayments = await _context.Payments
                    .Include(p => p.PurchaseOrder)
                    .OrderByDescending(p => p.PaymentDate)
                    .Take(5)
                    .Select(p => new RecentActivity
                    {
                        Type = "payment",
                        Description = $"Payment for {p.PurchaseOrder.PoNumber}",
                        Date = p.PaymentDate,
                        Status = p.Status,
                        Amount = p.Amount
                    })
                    .ToListAsync();

                var recentPOs = await _context.PurchaseOrders
                    .Include(po => po.Supplier)
                    .OrderByDescending(po => po.OrderDate)
                    .Take(5)
                    .Select(po => new RecentActivity
                    {
                        Type = "purchase_order",
                        Description = $"PO {po.PoNumber} - {po.Supplier.Name}",
                        Date = po.OrderDate,
                        Status = po.Status,
                        Amount = po.TotalAmount
                    })
                    .ToListAsync();

                var recentActivities = recentPayments.Concat(recentPOs)
                    .OrderByDescending(a => a.Date)
                    .Take(5)
                    .ToList();

                // Monthly spending
                var monthlySpending = await _context.Payments
                    .Where(p => p.Status == "paid" && p.PaymentDate >= startOfYear)
                    .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                    .Select(g => new 
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Amount = g.Sum(p => p.Amount)
                    })
                    .OrderBy(x => x.Year)
                    .ThenBy(x => x.Month)
                    .ToListAsync();

                var formattedMonthlySpending = monthlySpending
                    .Select(x => new MonthlySpending
                    {
                        Month = $"{x.Year}-{x.Month:D2}",
                        Amount = x.Amount
                    })
                    .ToList();

                // Top suppliers
                var topSuppliers = await _context.PurchaseOrders
                    .Include(po => po.Supplier)
                    .Where(po => po.Status != "cancelled")
                    .GroupBy(po => po.Supplier)
                    .Select(g => new TopSupplier
                    {
                        Name = g.Key.Name,
                        TotalAmount = g.Sum(po => po.TotalAmount),
                        OrderCount = g.Count()
                    })
                    .OrderByDescending(s => s.TotalAmount)
                    .Take(5)
                    .ToListAsync();

                return new DashboardStats
                {
                    TotalSuppliers = totalSuppliers,
                    TotalPurchaseOrders = totalPOs,
                    PendingPurchaseOrders = pendingPOs,
                    TotalSpent = totalSpent,
                    PendingPayments = pendingPayments,
                    RecentActivities = recentActivities,
                    MonthlySpending = formattedMonthlySpending,
                    TopSuppliers = topSuppliers
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching dashboard stats", error = ex.Message });
            }
        }
    }
}
