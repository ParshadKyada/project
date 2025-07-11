using AutoMapper;
using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using MediatR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateProductHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Check if SKU already exists
        var existingProduct = await _context.Products
            .FirstOrDefaultAsync(p => p.SKU == request.SKU && !p.IsDeleted, cancellationToken);

        if (existingProduct != null)
            throw new InvalidOperationException("Product with this SKU already exists");

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            SKU = request.SKU,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            ReorderLevel = request.ReorderLevel,
            CategoryId = request.CategoryId,
            SupplierId = request.SupplierId,
            IsActive = true
        };

        try
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex)
        {
            // Check if it's a unique constraint violation for the SKU
            if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 2601)
            {
                throw new InvalidOperationException("Product with this SKU already exists");
            }

            // Re-throw other database-related exceptions
            throw;
        }

        // Create alert if stock is at or below reorder level
        if (product.StockQuantity <= product.ReorderLevel)
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

        // Load related entities for DTO mapping
        var productWithIncludes = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstAsync(p => p.Id == product.Id, cancellationToken);

        return _mapper.Map<ProductDto>(productWithIncludes);
    }
}