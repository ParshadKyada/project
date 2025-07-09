using InventoryManagement.Application.DTOs.Products;
using MediatR;

namespace InventoryManagement.Application.Queries.Products;

public class GetSupplierByIdQuery : IRequest<SupplierDto?>
{
    public Guid Id { get; set; }
} 