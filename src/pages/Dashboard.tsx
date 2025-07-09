import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../types/alert';
import { dashboardService } from '../services/dashboardService';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      change: '-3%'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      case 'Low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening in your inventory.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white mr-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <span className="text-sm font-medium text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stat.change}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div className="space-y-3">
            {stats?.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {stats?.alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{alert.productName}</p>
                    <p className="text-sm text-gray-600">
                      Stock: {alert.currentStock} / Reorder: {alert.reorderLevel}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add Product</h4>
            <p className="text-sm text-gray-600">Add new product to inventory</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <ShoppingCart className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Create Order</h4>
            <p className="text-sm text-gray-600">Create new customer order</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Users</h4>
            <p className="text-sm text-gray-600">Add or edit user accounts</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;