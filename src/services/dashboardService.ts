import { DashboardStats, LowStockAlert } from '../types/alert';
import { getAuthHeaders } from './auth';

class DashboardService {
  // No backend API for dashboard stats or alerts. Implement when available.
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('https://localhost:7267/api/Dashboard/stats', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }

  async getLowStockAlerts(): Promise<LowStockAlert[]> {
    const res = await fetch('https://localhost:7267/api/Dashboard/alerts', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch low stock alerts');
    return res.json();
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    const res = await fetch(`https://localhost:7267/api/Dashboard/alerts/${alertId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark alert as read');
  }
}

export const dashboardService = new DashboardService();