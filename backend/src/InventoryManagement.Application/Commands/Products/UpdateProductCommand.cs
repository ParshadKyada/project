using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class UpdateProductCommand : IRequest<ProductDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int ReorderLevel { get; set; }
    public Guid CategoryId { get; set; }
    public Guid SupplierId { get; set; }
}