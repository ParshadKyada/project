using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class UpdateStockHandler : IRequestHandler<UpdateStockCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IMessageQueueService _messageQueue;

    public UpdateStockHandler(IApplicationDbContext context, IMessageQueueService messageQueue)
    {
        _context = context;
        _messageQueue = messageQueue;
    }

    public async Task<bool> Handle(UpdateStockCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && !p.IsDeleted, cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Product not found");

        var oldQuantity = product.StockQuantity;
        product.StockQuantity = request.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        // Create stock movement record
        var stockMovement = new StockMovement
        {
            ProductId = request.ProductId,
            UserId = request.UserId,
            Quantity = request.Quantity - oldQuantity,
            Type = request.Quantity > oldQuantity ? StockMovementType.In : StockMovementType.Out,
            Reason = request.Reason
        };

        _context.StockMovements.Add(stockMovement);

        // Check for low stock alert
        if (product.StockQuantity <= product.ReorderLevel)
        {
            var severity = product.StockQuantity == 0 ? AlertSeverity.OutOfStock :
                          product.StockQuantity <= (product.ReorderLevel * 0.5) ? AlertSeverity.Critical :
                          AlertSeverity.Low;

            var alert = new LowStockAlert
            {
                ProductId = product.Id,
                CurrentStock = product.StockQuantity,
                ReorderLevel = product.ReorderLevel,
                Severity = severity
            };

            _context.LowStockAlerts.Add(alert);

            await _messageQueue.PublishLowStockAlertAsync(
                product.Id, 
                product.Name, 
                product.StockQuantity, 
                product.ReorderLevel);
        }

        await _messageQueue.PublishStockUpdatedAsync(product.Id, oldQuantity, product.StockQuantity);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}