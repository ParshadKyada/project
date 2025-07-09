using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class CreateSupplierCommand : IRequest<SupplierDto>
{
    public string Name { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
} 