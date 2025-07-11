import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Order } from '../types/order';
import { orderService } from '../services/orderService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Eye, Edit, Search } from 'lucide-react';
import Modal from '../components/common/Modal';
import { CreateOrderRequest } from '../types/order';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { productService } from '../services/productService';
import { User } from '../types/auth';
import Pagination from '../components/common/Pagination';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<CreateOrderRequest>({
    customerId: '',
    items: [],
    notes: '',
  });
  const [customers, setCustomers] = useState<User[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isStaff = user?.role === 'Staff';
  const isCustomer = user?.role === 'Customer';

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    if (isAdmin || isStaff) {
      userService.getCustomers().then(setCustomers).catch(() => setCustomers([]));
    }
    productService.getProducts().then(setProducts).catch(() => setProducts([]));
  }, [isAdmin, isStaff]);

  // Open Create Order modal if ?add=1 is present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === '1') {
      setIsCreateModalOpen(true);
    }
  }, [location.search]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusReverseMap: Record<number, Order['status']> = {
    1: 'Pending',
    2: 'Confirmed',
    3: 'Shipped',
    4: 'Delivered',
    5: 'Cancelled',
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      // Map status number to string for UI
      const mappedOrder = {
        ...updatedOrder,
        status: typeof updatedOrder.status === 'number'
          ? statusReverseMap[updatedOrder.status]
          : updatedOrder.status,
      };
      setOrders(orders.map(order => order.id === orderId ? mappedOrder : order));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    setDetailLoading(true);
    setIsDetailModalOpen(true);
    // setSelectedOrderId(orderId);
    try {
      const order = await orderService.getOrder(orderId);
      setSelectedOrder(order);
    } catch (error) {
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const created = await orderService.createOrder(newOrder);
      setOrders([created, ...orders]);
      setIsCreateModalOpen(false);
      setNewOrder({ customerId: '', items: [], notes: '' });
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create order');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order Number',
      render: (order: Order) => (
        <div>
          <div className="font-medium text-gray-900">{order.orderNumber}</div>
          <div className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (order: Order) => order.customerName
    },
    {
      key: 'items',
      header: 'Items',
      render: (order: Order) => `${order.items.length} item(s)`
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (order: Order) => `$${order.totalAmount.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => (
        (isAdmin || (isStaff && order.assignedStaffId === user?.id)) ? (
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
            className={`px-3 py-1 text-sm font-medium rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        ) : (
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: Order) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Eye}
            onClick={() => handleViewOrder(order.id)}
          />
          {(isAdmin || (isStaff && order.assignedStaffId === user?.id)) && (
            <Button
              size="sm"
              variant="secondary"
              icon={Edit}
              onClick={() => handleViewOrder(order.id)}
            />
          )}
          {isAdmin && (
            <Button
              size="sm"
              variant="danger"
              icon={Edit}
              onClick={() => {/* TODO: handle delete */}}
            />
          )}
          {isCustomer && order.customerId === user?.id && order.status === 'Pending' && (
            <Button
              size="sm"
              variant="danger"
              icon={Edit}
              onClick={() => {/* TODO: handle cancel */}}
            />
          )}
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        {(isAdmin || isStaff || isCustomer) && (
          <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            Create Order
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table data={paginatedOrders} columns={columns} />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Order Details" size="lg">
        {detailLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="md" />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Order Number:</span> {selectedOrder.orderNumber}
            </div>
            <div>
              <span className="font-semibold">Customer:</span> {selectedOrder.customerName}
            </div>
            <div>
              <span className="font-semibold">Order Date:</span> {new Date(selectedOrder.orderDate).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {selectedOrder.status}
            </div>
            <div>
              <span className="font-semibold">Total Amount:</span> ${selectedOrder.totalAmount.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-6">
                {selectedOrder.items.map(item => (
                  <li key={item.id}>
                    {item.productName} — Qty: {item.quantity} @ ${item.unitPrice.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-red-500">Order not found.</div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Order" size="lg">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {(isAdmin || isStaff) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <select
                value={newOrder.customerId}
                onChange={e => setNewOrder({ ...newOrder, customerId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                ))}
              </select>
            </div>
          )}
          {isCustomer && (
            <input type="hidden" value={user?.id} />
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Products</label>
            {newOrder.items.map((item, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <select
                  value={item.productId}
                  onChange={e => {
                    const items = [...newOrder.items];
                    items[idx].productId = e.target.value;
                    setNewOrder({ ...newOrder, items });
                  }}
                  required
                  className="px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => {
                    const items = [...newOrder.items];
                    items[idx].quantity = Number(e.target.value);
                    setNewOrder({ ...newOrder, items });
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  required
                  placeholder="Qty"
                />
                <Button variant="danger" size="sm" onClick={() => {
                  setNewOrder({ ...newOrder, items: newOrder.items.filter((_, i) => i !== idx) });
                }} type="button">Remove</Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: '', quantity: 1 }] })} type="button">Add Product</Button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              value={newOrder.notes}
              onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {createError && <div className="text-red-500">{createError}</div>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={createLoading}>
              Create Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;