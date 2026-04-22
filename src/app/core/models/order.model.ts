export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id?: number;
  productId?: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface Order {
  id?: number;
  customerId?: number;
  customerName?: string;
  status?: OrderStatus;
  items?: OrderItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  createdAt?: string;
}
