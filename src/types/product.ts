export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  categoryId: string;
  supplierId: string;
  categoryName: string;
  supplierName: string;
  // category?: Category;
  // supplier?: Supplier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  productCount?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  reorderLevel: number;
  categoryId: string;
  supplierId: string;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface StockUpdateRequest {
  productId: string;
  quantity: number;
  reason: string;
}