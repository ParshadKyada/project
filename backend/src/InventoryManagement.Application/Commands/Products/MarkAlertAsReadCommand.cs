using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class MarkAlertAsReadCommand : IRequest
{
    public Guid AlertId { get; set; }
}