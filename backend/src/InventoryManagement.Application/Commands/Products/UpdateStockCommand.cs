using MediatR;

namespace InventoryManagement.Application.Commands.Products;

public class UpdateStockCommand : IRequest<bool>
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}