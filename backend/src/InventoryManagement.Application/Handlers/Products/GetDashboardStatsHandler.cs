using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Products;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class GetDashboardStatsHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardStatsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var products = await _context.Products.ToListAsync(cancellationToken);
        //var orders = await _context.Orders.Include(o => o.OrderItems).ThenInclude(oi => oi.Product).ToListAsync(cancellationToken);
        var orders = await _context.Orders
    .Include(o => o.Customer)
    .Include(o => o.OrderItems)
        .ThenInclude(oi => oi.Product)
    .ToListAsync(cancellationToken);
        var alerts = await _context.LowStockAlerts.ToListAsync(cancellationToken);

        var stats = new DashboardStatsDto
        {
            TotalProducts = products.Count,
            LowStockProducts = products.Count(p => p.StockQuantity > 0 && p.StockQuantity <= p.ReorderLevel),
            OutOfStockProducts = products.Count(p => p.StockQuantity == 0),
            TotalOrders = orders.Count,
            PendingOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Pending),
            TotalRevenue = orders.Sum(o => o.OrderItems.Sum(oi => oi.UnitPrice * oi.Quantity)),
            TopProducts = products.OrderByDescending(p => orders.SelectMany(o => o.OrderItems).Where(oi => oi.ProductId == p.Id).Sum(oi => oi.Quantity)).Take(5).Select(p => new TopProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                TotalSold = orders.SelectMany(o => o.OrderItems).Where(oi => oi.ProductId == p.Id).Sum(oi => oi.Quantity),
                Revenue = orders.SelectMany(o => o.OrderItems).Where(oi => oi.ProductId == p.Id).Sum(oi => oi.UnitPrice * oi.Quantity)
            }).ToList(),
            //RecentOrders = orders.OrderByDescending(o => o.OrderDate).Take(5).Select(o => new RecentOrderDto
            //{
            //    OrderId = o.Id,
            //    OrderNumber = o.OrderNumber,
            //    CustomerName = o.CustomerName,
            //    OrderDate = o.OrderDate,
            //    TotalAmount = o.OrderItems.Sum(oi => oi.UnitPrice * oi.Quantity)
            //}).ToList(),
            RecentOrders = orders.OrderByDescending(o => o.OrderDate).Take(5).Select(o => new RecentOrderDto
            {
                OrderId = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = $"{o.Customer.FirstName} {o.Customer.LastName}",
                OrderDate = o.OrderDate,
                TotalAmount = o.OrderItems.Sum(oi => oi.UnitPrice * oi.Quantity)
            }).ToList(),

            Alerts = alerts.Select(a => new LowStockAlertDto
            {
                Id = a.Id,
                ProductId = a.ProductId,
                ProductName = products.FirstOrDefault(p => p.Id == a.ProductId)?.Name ?? string.Empty,
                CurrentStock = a.CurrentStock,
                ReorderLevel = a.ReorderLevel,
                Severity = a.Severity.ToString(),
                CreatedAt = a.CreatedAt,
                IsRead = a.IsRead
            }).ToList()
        };
        return stats;
    }
}