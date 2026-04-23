export interface User {
  id: number;
  name: string;
  username: string;
  role: string;
  createdAt?: string;
}

export interface Category {
  id: number;
  nombre: string;
  name?: string; // For compatibility
}

export interface Product {
  id_producto: number;
  code: string;
  nombre: string;
  marca?: string;
  tamano?: string;
  tipo?: string;
  precio_costo?: number;
  precio_unidad: number;
  precio_docena: number;
  precio_mayoreo: number;
  cantidad: number;
  alerta_cantidad: number;
  id_categoria: number;
  category?: Category | null;
}

export interface SaleItem {
  id: number;
  cantidad: number;
  precio: number;
  sub_total: number;
  product: Product;
}

export interface Sale {
  id: number;
  rpNumber: string;
  customer: string;
  date: string;
  total: number;
  items: SaleItem[];
}

export interface PurchaseItem {
  id: number;
  cantidad: number;
  precio: number;
  sub_total: number;
  product: Product;
}

export interface Purchase {
  id: number;
  poNumber: string;
  provider: string;
  date: string;
  total: number;
  items: PurchaseItem[];
}
