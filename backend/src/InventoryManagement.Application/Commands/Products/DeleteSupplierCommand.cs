using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class DeleteSupplierCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
} 