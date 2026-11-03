import type {
  ApiResponse,
  CreateOrderPayload,
  Customer,
  CustomerInput,
  Order,
  Product,
  ProductInput,
} from "@/types/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const result = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    const fieldErrors = result.errors
      ? Object.entries(result.errors)
          .flatMap(([field, messages]) =>
            messages.map((message) => `${humanizeField(field)}: ${message}`),
          )
          .join("\n")
      : "";
    throw new ApiError(fieldErrors || result.message || "Permintaan gagal.", response.status);
  }

  return result;
}

function humanizeField(field: string) {
  const itemMatch = field.match(/^items\.(\d+)\.(.+)$/);
  if (itemMatch) {
    const itemNumber = Number(itemMatch[1]) + 1;
    const itemField = itemMatch[2] === "quantity" ? "jumlah" : itemMatch[2];
    return `Produk baris ${itemNumber}, ${itemField}`;
  }

  if (field === "customer_id") return "Pelanggan";
  return field.replaceAll("_", " ");
}

export async function getProducts({ search = "", page = 1, perPage = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (search.trim()) params.set("search", search.trim());
  return request<Product[]>(`/api/backend/products?${params.toString()}`);
}

export async function createProduct(payload: ProductInput) {
  return request<Product>("/api/backend/products", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateProduct(id: number, payload: ProductInput) {
  return request<Product>(`/api/backend/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function getCustomers(page = 1, perPage = 10) {
  return request<Customer[]>(`/api/backend/customers?page=${page}&per_page=${perPage}`);
}

export async function createCustomer(payload: CustomerInput) {
  return request<Customer>("/api/backend/customers", { method: "POST", body: JSON.stringify(payload) });
}

export type OrderFilters = {
  page?: number;
  perPage?: number;
  status?: string;
  from?: string;
  to?: string;
};

export async function getOrders({ page = 1, perPage = 10, status = "", from = "", to = "" }: OrderFilters = {}) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (status) params.set("status", status);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return request<Order[]>(`/api/backend/orders?${params.toString()}`);
}

export async function getOrder(id: number) {
  return request<Order>(`/api/backend/orders/${id}`);
}

export async function createOrder(payload: CreateOrderPayload) {
  return request<Order>("/api/backend/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(orderId: number, action: "pay" | "cancel") {
  return request<Order>(`/api/backend/orders/${orderId}/${action}`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}
