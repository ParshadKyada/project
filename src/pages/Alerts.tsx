import React, { useState, useEffect } from 'react';
import { LowStockAlert } from '../types/alert';
import { dashboardService } from '../services/dashboardService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAlert, setViewingAlert] = useState<LowStockAlert | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const data = await dashboardService.getLowStockAlerts();
        if (isMounted) {
          setAlerts(data);
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching alerts:', error);
          setLoading(false);
        }
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'OutOfStock': return 'bg-red-100 text-red-800 border-red-200';
      case 'Low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'OutOfStock':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Low':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await dashboardService.markAlertAsRead(alertId);
      // Re-fetch alerts after marking as read
      setLoading(true);
      const data = await dashboardService.getLowStockAlerts();
      setAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const readAlerts = alerts.filter(alert => alert.isRead);
  const sortedAlerts = [
    ...unreadAlerts,
    ...readAlerts
  ];
  const paginatedAlerts = sortedAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Alerts</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {unreadAlerts.length} unread alerts
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'OutOfStock').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'Critical').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'Low').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts List (paginated) */}
      <div className="space-y-3">
        {paginatedAlerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity).includes('red') ? 'border-l-red-500' : getSeverityColor(alert.severity).includes('yellow') ? 'border-l-yellow-500' : 'border-l-gray-500'}${alert.isRead ? ' opacity-60' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getSeverityIcon(alert.severity)}
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">{alert.productName}</h3>
                  <p className="text-sm text-gray-600">
                    Current stock: {alert.currentStock} | Reorder level: {alert.reorderLevel}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Eye}
                  onClick={() => setViewingAlert(alert)}
                />
                {!alert.isRead && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={CheckCircle}
                    onClick={() => handleMarkAsRead(alert.id)}
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* View Alert Modal */}
      <Modal isOpen={!!viewingAlert} onClose={() => setViewingAlert(null)} title="Alert Details" size="md">
        {viewingAlert && (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Product:</span> {viewingAlert.productName}
            </div>
            <div>
              <span className="font-semibold">Current Stock:</span> {viewingAlert.currentStock}
            </div>
            <div>
              <span className="font-semibold">Reorder Level:</span> {viewingAlert.reorderLevel}
            </div>
            <div>
              <span className="font-semibold">Severity:</span> {viewingAlert.severity}
            </div>
            <div>
              <span className="font-semibold">Created At:</span> {new Date(viewingAlert.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {viewingAlert.isRead ? 'Read' : 'Unread'}
            </div>
          </div>
        )}
      </Modal>

      {alerts.length === 0 && (
        <Card className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
          <p className="text-gray-600">All products are adequately stocked.</p>
        </Card>
      )}
    </div>
  );
};

export default Alerts;