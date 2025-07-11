using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class UpdateProductCommand : IRequest<ProductDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string SKU { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int ReorderLevel { get; set; }
    public Guid CategoryId { get; set; }
    public Guid SupplierId { get; set; }
    public bool IsActive { get; set; } 
}