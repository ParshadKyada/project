using InventoryManagement.Application.Commands.Orders;
using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;

namespace InventoryManagement.Application.Handlers.Orders
{
    public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, OrderDto>
    {
        private readonly IApplicationDbContext _context;

        public UpdateOrderStatusHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OrderDto> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                throw new InvalidOperationException("Order not found");

            order.Status = request.Status;
            await _context.SaveChangesAsync(cancellationToken);

            return new OrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                Notes = order.Notes,
                CustomerId = order.CustomerId,
                CustomerName = order.Customer.FirstName + " " + order.Customer.LastName,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product != null ? oi.Product.Name : string.Empty,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.TotalPrice
                }).ToList()
            };
        }
    }
} 