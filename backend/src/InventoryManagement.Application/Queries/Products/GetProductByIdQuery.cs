using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Queries.Products;

public class GetProductByIdQuery : IRequest<ProductDto?>
{
    public Guid Id { get; set; }
}