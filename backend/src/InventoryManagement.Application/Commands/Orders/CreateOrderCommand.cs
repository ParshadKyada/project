using InventoryManagement.Application.DTOs.Orders;
using MediatR;

namespace InventoryManagement.Application.Commands.Orders;

public class CreateOrderCommand : IRequest<OrderDto>
{
    public Guid CustomerId { get; set; }
    public string? Notes { get; set; }
    public List<CreateOrderItemDto> Items { get; set; } = new();
}