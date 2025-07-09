using InventoryManagement.Application.DTOs.Orders;
using MediatR;
using System;

namespace InventoryManagement.Application.Queries.Orders
{
    public class GetOrderByIdQuery : IRequest<OrderDto>
    {
        public Guid Id { get; set; }
    }
} 