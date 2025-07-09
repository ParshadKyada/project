using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Domain.Enums;
using MediatR;

namespace InventoryManagement.Application.Queries.Orders;

public class GetOrdersQuery : IRequest<List<OrderDto>>
{
    public string? SearchTerm { get; set; }
    public OrderStatus? Status { get; set; }
    public Guid? CustomerId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public Guid? AssignedStaffId { get; set; } // For staff filtering
    public bool IsForCurrentUserOnly { get; set; } // For customer filtering
}