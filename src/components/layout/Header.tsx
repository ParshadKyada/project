import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread alerts count (simple polling)
  const fetchAlerts = async () => {
    try {
      const { dashboardService } = await import('../../services/dashboardService');
      const data = await dashboardService.getLowStockAlerts();
      setAlerts(Array.isArray(data) ? data.filter((a: any) => a && a.isRead === false) : []);
    } catch (e) {
      // Optionally log error
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchAlerts();
    // Listen for visibility change to refetch alerts when tab becomes active
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchAlerts();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    const interval = setInterval(() => { if (isMounted) fetchAlerts(); }, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Smart Inventory System
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                onClick={() => setShowDropdown((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b font-semibold text-gray-900 flex justify-between items-center">
                    <span>Notifications</span>
                    {alerts.length > 0 && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const { dashboardService } = await import('../../services/dashboardService');
                          await Promise.all(alerts.map((a: any) => dashboardService.markAlertAsRead(a.id)));
                          fetchAlerts();
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm">No new notifications</div>
                    ) : (
                      alerts.slice(0, 5).map((alert: any) => (
                        <div key={alert.id} className="flex items-start px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 group">
                          <Bell className="h-5 w-5 text-orange-500 mt-1 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{alert.productName}</div>
                            <div className="text-xs text-gray-600">{alert.severity} - Stock: {alert.currentStock}</div>
                            <div className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleString()}</div>
                          </div>
                          <button
                            className="ml-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as read"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { dashboardService } = await import('../../services/dashboardService');
                              await dashboardService.markAlertAsRead(alert.id);
                              fetchAlerts();
                            }}
                          >
                            Mark as read
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t text-center">
                    <a href="/alerts" className="text-blue-600 hover:underline text-sm">View all alerts</a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user?.role}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-2"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;