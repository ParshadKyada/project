import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Product, Category, Supplier } from '../types/product';
import { productService } from '../services/productService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react';
import Pagination from '../components/common/Pagination';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);  // Error message state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData, suppliersData] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
          productService.getSuppliers()
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open Add Product modal if ?add=1 is present in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === '1') {
      setEditingProduct(null);
      setIsModalOpen(true);
    }
  }, [location.search]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (product.stockQuantity <= product.reorderLevel) {
      // Show 'Critical' if stock is less than or equal to half the reorder level, else 'Low Stock'
      if (product.stockQuantity <= Math.max(1, Math.floor(product.reorderLevel / 2))) {
        return { label: 'Critical', color: 'bg-orange-100 text-orange-800' };
      }
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Product Name',
      render: (product: Product) => (
        <div>
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.sku}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (product: Product) => product.categoryName || 'N/A'
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (product: Product) => product.supplierName || 'N/A'
    },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => `$${product.price.toFixed(2)}`
    },
    {
      key: 'stockQuantity',
      header: 'Stock',
      render: (product: Product) => {
        const status = getStockStatus(product);
        return (
          <div className="flex items-center">
            <span className="font-medium mr-2">{product.stockQuantity}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            icon={Eye}
            onClick={() => setViewingProduct(product)}
          />
          <Button
            size="sm"
            variant="secondary"
            icon={Edit}
            onClick={() => {
              setEditingProduct(product);
              setIsModalOpen(true);
            }}
          />
          <Button
            size="sm"
            variant="danger"
            icon={Trash2}
            onClick={() => handleDelete(product.id)}
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
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button
          icon={Plus}
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <Table data={paginatedProducts} columns={columns} />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        suppliers={suppliers}
        errorMessage={errorMessage}  // Pass error message to modal
        onSave={(product) => {
          if (editingProduct) {
            setProducts(products.map(p => p.id === product.id ? product : p));
          } else {
            setProducts([...products, product]);
          }
          setIsModalOpen(false);
        }}
        setErrorMessage={setErrorMessage}  // Clear error message when modal is closed
      />

      {/* Product View Modal */}
      <Modal isOpen={!!viewingProduct} onClose={() => setViewingProduct(null)} title="Product Details" size="lg">
        {viewingProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Name:</span> {viewingProduct.name}
              </div>
              <div>
                <span className="font-semibold">SKU:</span> {viewingProduct.sku}
              </div>
              <div>
                <span className="font-semibold">Category:</span> {viewingProduct.categoryName || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Supplier:</span> {viewingProduct.supplierName || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Price:</span> ${viewingProduct.price.toFixed(2)}
              </div>
              <div>
                <span className="font-semibold">Stock Quantity:</span> {viewingProduct.stockQuantity}
              </div>
              <div>
                <span className="font-semibold">Reorder Level:</span> {viewingProduct.reorderLevel}
              </div>
            </div>
            <div>
              <span className="font-semibold">Description:</span>
              <div className="mt-1 text-gray-700 whitespace-pre-line">{viewingProduct.description || 'N/A'}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  errorMessage: string | null;
  onSave: (product: Product) => void;
  setErrorMessage: (message: string | null) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  suppliers,
  errorMessage,
  onSave,
  setErrorMessage
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    stockQuantity: '',
    reorderLevel: '',
    categoryId: '',
    supplierId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        reorderLevel: product.reorderLevel.toString(),
        categoryId: product.categoryId,
        supplierId: product.supplierId
      });
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: '',
        stockQuantity: '',
        reorderLevel: '',
        categoryId: '',
        supplierId: ''
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        reorderLevel: parseInt(formData.reorderLevel),
        categoryId: formData.categoryId,
        supplierId: formData.supplierId
      };

      let savedProduct;
      if (product) {
        savedProduct = await productService.updateProduct({ ...productData, id: product.id });
      } else {
        savedProduct = await productService.createProduct(productData);
      }

      onSave(savedProduct);
    } catch(error: any) {
      console.error('Error saving product:', error);  // Log the full error for debugging

      // Check if the error response exists and has the expected data
      if (error?.response?.data?.message) {
        const message = error.response.data.message;  // Extract the error message
        setErrorMessage(message);  // Set the error message to state
      } else if (error?.message) {
        // Handle other types of errors (like network issues)
        setErrorMessage(error.message);
      } else {
        // Fallback for unexpected errors
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="text-red-500 text-sm mb-4">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
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
              SKU
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier
            </label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Level
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleInputChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {product ? 'Update' : 'Create'} Product
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Products;
