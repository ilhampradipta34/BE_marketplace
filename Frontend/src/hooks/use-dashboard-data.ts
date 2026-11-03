"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  createOrder,
  createProduct,
  getCustomers,
  getOrder,
  getOrders,
  getProducts,
  updateOrderStatus,
  updateProduct,
  type OrderFilters,
} from "@/lib/api-client";
import type { CreateOrderPayload, CustomerInput, ProductInput } from "@/types/api";

type DashboardDataOptions = {
  search: string;
  productPage: number;
  customerPage: number;
  orderFilters: OrderFilters;
  selectedOrderId: number | null;
  onError: (message: string) => void;
  onOrderError: (message: string) => void;
  onOrderCreated: (orderNumber: string) => void;
  onProductSaved: (message: string) => void;
  onCustomerCreated: (message: string) => void;
};

export function useDashboardData(options: DashboardDataOptions) {
  const {
    search, productPage, customerPage, orderFilters, selectedOrderId,
    onError, onOrderError, onOrderCreated, onProductSaved, onCustomerCreated,
  } = options;
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products", search, productPage],
    queryFn: () => getProducts({ search, page: productPage, perPage: 10 }),
  });
  const orderProductsQuery = useQuery({
    queryKey: ["products", "order-options"],
    queryFn: () => getProducts({ page: 1, perPage: 100 }),
  });
  const customersQuery = useQuery({
    queryKey: ["customers", customerPage],
    queryFn: () => getCustomers(customerPage, 10),
  });
  const orderCustomersQuery = useQuery({
    queryKey: ["customers", "order-options"],
    queryFn: () => getCustomers(1, 100),
  });
  const ordersQuery = useQuery({
    queryKey: ["orders", orderFilters],
    queryFn: () => getOrders({ ...orderFilters, perPage: 10 }),
  });
  const summaryOrdersQuery = useQuery({
    queryKey: ["orders", "summary"],
    queryFn: () => getOrders({ page: 1, perPage: 100 }),
  });
  const orderDetailQuery = useQuery({
    queryKey: ["order", selectedOrderId],
    queryFn: () => getOrder(selectedOrderId as number),
    enabled: selectedOrderId !== null,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, action }: { orderId: number; action: "pay" | "cancel" }) =>
      updateOrderStatus(orderId, action),
    onSuccess: () => {
      onError("");
      return queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error) => onError(error.message),
  });
  const orderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: (result) => {
      onOrderCreated(result.data.order_number);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => onOrderError(error.message),
  });
  const productMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: number; payload: ProductInput }) =>
      id ? updateProduct(id, payload) : createProduct(payload),
    onSuccess: (_, variables) => {
      onProductSaved(variables.id ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => onError(error.message),
  });
  const customerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      onCustomerCreated("Pelanggan berhasil ditambahkan.");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: Error) => onError(error.message),
  });

  return {
    productsQuery, orderProductsQuery, customersQuery, orderCustomersQuery, ordersQuery, summaryOrdersQuery, orderDetailQuery,
    statusMutation, orderMutation, productMutation, customerMutation,
  };
}
