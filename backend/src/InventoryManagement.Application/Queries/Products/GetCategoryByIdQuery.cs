using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Queries.Products;

public class GetCategoryByIdQuery : IRequest<CategoryDto?>
{
    public Guid Id { get; set; }
} 