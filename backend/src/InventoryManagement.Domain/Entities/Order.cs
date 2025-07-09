using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    
    // Foreign keys
    public Guid CustomerId { get; set; }
    public Guid? AssignedStaffId { get; set; }
    
    // Navigation properties
    public virtual User Customer { get; set; } = null!;
    public virtual User? AssignedStaff { get; set; }
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}