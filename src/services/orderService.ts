import { Order, CreateOrderRequest, OrderSummary } from '../types/order';
import { getAuthHeaders } from './auth';
class OrderService {
  private baseUrl = 'https://localhost:7267/api';

  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${this.baseUrl}/Orders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const data = await res.json();
    // Map status number to string for all orders
    const statusReverseMap: Record<number, Order['status']> = {
      1: 'Pending',
      2: 'Confirmed',
      3: 'Shipped',
      4: 'Delivered',
      5: 'Cancelled',
    };
    return data.map((order: any) => ({
      ...order,
      status: typeof order.status === 'number'
        ? statusReverseMap[order.status]
        : order.status,
    }));
  }

  async getOrder(id: string): Promise<Order | null> {
    const res = await fetch(`${this.baseUrl}/Orders/${id}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  }

  async createOrder(request: CreateOrderRequest): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/Orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const statusMap = {
      Pending: 1,
      Confirmed: 2,
      Shipped: 3,
      Delivered: 4,
      Cancelled: 5,
    };
    const payload = { orderId: id, status: statusMap[status] };
    console.log('Updating order status:', id, status, payload);
    const res = await fetch(`${this.baseUrl}/Orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    console.log('Status update response:', res.status, res.statusText);
    if (!res.ok) {
      const text = await res.text();
      console.error('Failed to update order status:', text);
      throw new Error('Failed to update order status: ' + text);
    }
    return res.json();
  }

  // No backend endpoint found for order summary. Implement when available.
  async getOrderSummary(): Promise<OrderSummary> {
    const res = await fetch(`${this.baseUrl}/Orders/summary`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch order summary');
    return res.json();
  }
}

export const orderService = new OrderService();