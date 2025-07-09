using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class UpdateCategoryCommand : IRequest<CategoryDto>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
} 