import { Product, CreateProductRequest, UpdateProductRequest, Category, Supplier } from '../types/product';
import { getAuthHeaders } from './auth';

class ProductService {
  private baseUrl = 'https://localhost:7267/api';

  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${this.baseUrl}/Products`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }

  async getProduct(id: string): Promise<Product | null> {
    const res = await fetch(`${this.baseUrl}/Products/${id}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/Products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });
    // if (!res.ok) throw new Error('Failed to create product');
    console.log(res.formData)
    if (!res.ok) throw new Error();
    return res.json();
  }

  async updateProduct(request: UpdateProductRequest): Promise<Product> {
    const res = await fetch(`${this.baseUrl}/Products/${request.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/Products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
  }

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${this.baseUrl}/Categories`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  }

  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${this.baseUrl}/Suppliers`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return res.json();
  }

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/Categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const res = await fetch(`${this.baseUrl}/Categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(category),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const res = await fetch(`${this.baseUrl}/Categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ ...category, id }),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  }

  async deleteSupplier(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/Suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete supplier');
  }

  async addSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${this.baseUrl}/Suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(supplier),
    });
    if (!res.ok) throw new Error('Failed to create supplier');
    return res.json();
  }

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const res = await fetch(`${this.baseUrl}/Suppliers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ ...supplier, id }),
    });
    if (!res.ok) throw new Error('Failed to update supplier');
    return res.json();
  }
}

export const productService = new ProductService();