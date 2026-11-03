export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
  errors?: Record<string, string[]>;
}

export interface LoginData {
  token: string;
  token_type: "Bearer";
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Product {
  id: number;
  product_code: string;
  name: string;
  variant: string | null;
  price: number;
  stock: number;
}

export type ProductInput = Omit<Product, "id">;

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export type CustomerInput = Omit<Customer, "id">;

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED";

export interface OrderItem {
  product_id: number;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  customer: Customer | null;
  items: OrderItem[];
  total: number;
  created_at: string | null;
}

export interface CreateOrderPayload {
  customer_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}
