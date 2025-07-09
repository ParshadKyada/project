using AutoMapper;
using InventoryManagement.Application.Commands.Products;
using InventoryManagement.Application.DTOs.Products;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Handlers.Products;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IMessageQueueService _messageQueue;

    public CreateProductHandler(IApplicationDbContext context, IMapper mapper, IMessageQueueService messageQueue)
    {
        _context = context;
        _mapper = mapper;
        _messageQueue = messageQueue;
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

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        // Check if stock is below reorder level
        if (product.StockQuantity <= product.ReorderLevel)
        {
            await _messageQueue.PublishLowStockAlertAsync(
                product.Id, 
                product.Name, 
                product.StockQuantity, 
                product.ReorderLevel);
        }

        // Load related entities for DTO mapping
        var productWithIncludes = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstAsync(p => p.Id == product.Id, cancellationToken);

        return _mapper.Map<ProductDto>(productWithIncludes);
    }
}