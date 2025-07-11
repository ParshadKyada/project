using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Domain.Entities;

public class LowStockAlert : BaseEntity
{
    public Guid Id { get; set; }
    public int CurrentStock { get; set; }
    public int ReorderLevel { get; set; }
    public AlertSeverity Severity { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime? ReadAt { get; set; }
    
    // Foreign keys
    public Guid ProductId { get; set; }
    
    // Navigation properties
    public virtual Product Product { get; set; } = null!;
}