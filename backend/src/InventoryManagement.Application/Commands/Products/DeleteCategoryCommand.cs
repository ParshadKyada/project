using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class DeleteCategoryCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
} 