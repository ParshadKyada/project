using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Domain.Entities;

public class StockMovement : BaseEntity
{
    public int Quantity { get; set; }
    public StockMovementType Type { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Reference { get; set; }
    
    // Foreign keys
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    
    // Navigation properties
    public virtual Product Product { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}