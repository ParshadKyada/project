import React, { useState, useEffect } from 'react';
import { Supplier } from '../types/product';
import { productService } from '../services/productService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await productService.getSuppliers();
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await productService.deleteSupplier(id);
        setSuppliers(suppliers.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Supplier Name',
      render: (supplier: Supplier) => (
        <div>
          <div className="font-medium text-gray-900">{supplier.name}</div>
          <div className="text-sm text-gray-500">{supplier.address}</div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (supplier: Supplier) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-1" />
            {supplier.contactEmail}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-1" />
            {supplier.contactPhone}
          </div>
        </div>
      )
    },
    {
      key: 'productCount',
      header: 'Products',
      render: (supplier: Supplier) => (
        <span className="text-sm text-gray-600">{supplier.productCount || 0} products</span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (supplier: Supplier) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {supplier.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (supplier: Supplier) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Edit}
            onClick={() => {
              setEditingSupplier(supplier);
              setIsModalOpen(true);
            }}
          />
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => handleDelete(supplier.id)}
          />
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
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingSupplier(null);
            setIsModalOpen(true);
          }}
        >
          Add Supplier
        </Button>
      </div>

      <Card>
        <Table data={suppliers} columns={columns} />
      </Card>

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={editingSupplier}
        onSave={async (supplier) => {
          if (editingSupplier) {
            productService.updateSupplier(supplier.id, supplier);
          } else {
            productService.addSupplier(supplier);
          }
          const suppliers = await productService.getSuppliers();
          setSuppliers(suppliers);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: (supplier: Supplier) => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contactEmail: supplier.contactEmail,
        contactPhone: supplier.contactPhone,
        address: supplier.address,
        isActive: supplier.isActive
      });
    } else {
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        isActive: true
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const savedSupplier: Supplier = {
        id: supplier?.id || Date.now().toString(),
        name: formData.name,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        isActive: formData.isActive,
        productCount: supplier?.productCount || 0
      };

      onSave(savedSupplier);
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : 'Add Supplier'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {supplier ? 'Update' : 'Create'} Supplier
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Suppliers;