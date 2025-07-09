using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class MarkAlertAsReadCommand : IRequest<Unit>
{
    public Guid AlertId { get; set; }
} 