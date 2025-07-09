using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Domain.Enums;
using MediatR;

namespace InventoryManagement.Application.Commands.Orders;

public class UpdateOrderStatusCommand : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
    public OrderStatus Status { get; set; }
}