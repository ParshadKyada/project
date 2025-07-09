using InventoryManagement.Application.DTOs.Orders;
using MediatR;

namespace InventoryManagement.Application.Queries.Orders;

public class GetOrderSummaryQuery : IRequest<OrderSummaryDto>
{
} 