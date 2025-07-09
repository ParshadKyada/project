export interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  severity: 'Low' | 'Critical' | 'Out of Stock';
  createdAt: string;
  isRead: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  topProducts: TopProduct[];
  recentOrders: Order[];
  alerts: LowStockAlert[];
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}