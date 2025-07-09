using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Queries.Products;

public class GetProductsQuery : IRequest<List<ProductDto>>
{
    public string? SearchTerm { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? SupplierId { get; set; }
    public bool? IsActive { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}