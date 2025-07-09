using AutoMapper;
using InventoryManagement.Application.Commands.Orders;
using InventoryManagement.Application.DTOs.Orders;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Orders;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMessageQueueService _messageQueue;

    public CreateOrderHandler(IApplicationDbContext context, IMapper mapper, IMessageQueueService messageQueue)
    {
        _context = context;
        _mapper = mapper;
        _messageQueue = messageQueue;
    }

    public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        // Validate customer exists
        var customer = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.CustomerId && !u.IsDeleted, cancellationToken);
        
        if (customer == null)
            throw new InvalidOperationException("Customer not found");

        // Generate order number
        var orderCount = await _context.Orders.CountAsync(cancellationToken);
        var orderNumber = $"ORD-{DateTime.UtcNow.Year}-{(orderCount + 1):D6}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerId = request.CustomerId,
            Notes = request.Notes,
            Status = OrderStatus.Pending
        };

        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == item.ProductId && !p.IsDeleted, cancellationToken);

            if (product == null)
                throw new InvalidOperationException($"Product with ID {item.ProductId} not found");

            if (product.StockQuantity < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for product {product.Name}");

            var orderItem = new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price,
                TotalPrice = product.Price * item.Quantity
            };

            order.OrderItems.Add(orderItem);
            totalAmount += orderItem.TotalPrice;

            // Update stock
            product.StockQuantity -= item.Quantity;
            product.UpdatedAt = DateTime.UtcNow;

            // Create stock movement
            var stockMovement = new StockMovement
            {
                ProductId = product.Id,
                UserId = request.CustomerId,
                Quantity = -item.Quantity,
                Type = StockMovementType.Out,
                Reason = $"Order {orderNumber}",
                Reference = orderNumber
            };

            _context.StockMovements.Add(stockMovement);
        }

        order.TotalAmount = totalAmount;
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        await _messageQueue.PublishOrderCreatedAsync(order.Id, order.OrderNumber);

        // Load order with includes for DTO mapping
        var orderWithIncludes = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .FirstAsync(o => o.Id == order.Id, cancellationToken);

        return _mapper.Map<OrderDto>(orderWithIncludes);
    }
}