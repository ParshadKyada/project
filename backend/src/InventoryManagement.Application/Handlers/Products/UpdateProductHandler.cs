using AutoMapper;
using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateProductHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Product not found");

        product.Name = request.Name;
        product.Description = request.Description;
        product.SKU = request.SKU;
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.ReorderLevel = request.ReorderLevel;
        product.CategoryId = request.CategoryId;
        product.SupplierId = request.SupplierId;
        product.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        // Create alert if stock is at or below reorder level and no unread alert exists
        if (product.StockQuantity <= product.ReorderLevel)
        {
            var existingAlert = await _context.LowStockAlerts
                .FirstOrDefaultAsync(a => a.ProductId == product.Id && !a.IsRead, cancellationToken);

            if (existingAlert == null)
            {
                AlertSeverity severity;
                if (product.StockQuantity == 0)
                    severity = AlertSeverity.OutOfStock;
                else if (product.StockQuantity <= (product.ReorderLevel / 2))
                    severity = AlertSeverity.Critical;
                else
                    severity = AlertSeverity.Low;

                _context.LowStockAlerts.Add(new LowStockAlert
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    CurrentStock = product.StockQuantity,
                    ReorderLevel = product.ReorderLevel,
                    Severity = severity,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                });
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        // Load related entities for DTO mapping
        var productWithIncludes = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstAsync(p => p.Id == product.Id, cancellationToken);

        return _mapper.Map<ProductDto>(productWithIncludes);
    }
}
