import React, { useState, useEffect } from 'react';
import { Category } from '../types/product';
import { productService } from '../services/productService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await productService.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Category Name',
      render: (category: Category) => (
        <div>
          <div className="font-medium text-gray-900">{category.name}</div>
          <div className="text-sm text-gray-500">{category.description}</div>
        </div>
      )
    },
    {
      key: 'productCount',
      header: 'Products',
      render: (category: Category) => (
        <span className="text-sm text-gray-600">{category.productCount || 0} products</span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (category: Category) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category: Category) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Edit}
            onClick={() => {
              setEditingCategory(category);
              setIsModalOpen(true);
            }}
          />
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => handleDelete(category.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <Card>
        <Table data={categories} columns={columns} />
      </Card>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSave={(category) => {
          if (editingCategory) {
            productService.updateCategory(category.id, category);
            setCategories(categories.map(c => c.id === category.id ? category : c));
          } else {
            productService.createCategory(category);
            setCategories([...categories, category]);
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSave: (category: Category) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        isActive: category.isActive
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isActive: true
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const savedCategory: Category = {
        id: category?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        productCount: category?.productCount || 0
      };

      onSave(savedCategory);
    } catch (error) {
      console.error('Error saving category:', error);
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
      title={category ? 'Edit Category' : 'Add Category'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
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
            {category ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Categories;