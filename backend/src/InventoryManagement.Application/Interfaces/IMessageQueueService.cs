namespace InventoryManagement.Application.Interfaces;

public interface IMessageQueueService
{
    Task PublishLowStockAlertAsync(Guid productId, string productName, int currentStock, int reorderLevel);
    Task PublishOrderCreatedAsync(Guid orderId, string orderNumber);
    Task PublishStockUpdatedAsync(Guid productId, int oldQuantity, int newQuantity);
}