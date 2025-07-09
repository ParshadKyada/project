using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Application.Queries.Orders;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Orders;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, List<OrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(o => o.OrderNumber.Contains(request.SearchTerm));
        }

        if (request.Status.HasValue)
        {
            query = query.Where(o => o.Status == request.Status.Value);
        }

        if (request.CustomerId.HasValue)
        {
            query = query.Where(o => o.CustomerId == request.CustomerId.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(o => o.OrderDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(o => o.OrderDate <= request.ToDate.Value);
        }

        // Role-based filtering
        if (request.IsForCurrentUserOnly && request.CustomerId.HasValue)
        {
            // Customer: only their own orders
            query = query.Where(o => o.CustomerId == request.CustomerId.Value);
        }
        else if (request.AssignedStaffId.HasValue)
        {
            // Staff: only assigned orders
            query = query.Where(o => o.AssignedStaffId == request.AssignedStaffId.Value);
        }
        // Admin: no filter (see all)

        // Pagination
        query = query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        var orders = await query.ToListAsync(cancellationToken);

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            OrderDate = o.OrderDate,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            Notes = o.Notes,
            CustomerId = o.CustomerId,
            CustomerName = o.Customer.FirstName + " " + o.Customer.LastName,
            Items = o.OrderItems.Select(oi => new OrderItemDto
            {
                ProductId = oi.ProductId,
                ProductName = oi.Product.Name,
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice,
                TotalPrice = oi.TotalPrice
            }).ToList()
        }).ToList();
    }
}
