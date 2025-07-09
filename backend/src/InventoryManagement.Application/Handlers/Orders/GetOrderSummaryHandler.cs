using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Orders;

public class GetOrderSummaryHandler : IRequestHandler<GetOrderSummaryQuery, OrderSummaryDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderSummaryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderSummaryDto> Handle(GetOrderSummaryQuery request, CancellationToken cancellationToken)
    {
        var orders = await _context.Orders.ToListAsync(cancellationToken);
        var today = DateTime.UtcNow.Date;
        var todayOrders = orders.Where(o => o.OrderDate.Date == today).ToList();
        return new OrderSummaryDto
        {
            TotalOrders = orders.Count,
            PendingOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Pending),
            CompletedOrders = orders.Count(o => o.Status == Domain.Enums.OrderStatus.Delivered),
            TotalRevenue = orders.Sum(o => o.TotalAmount),
            TodayOrders = todayOrders.Count,
            TodayRevenue = todayOrders.Sum(o => o.TotalAmount)
        };
    }
} 