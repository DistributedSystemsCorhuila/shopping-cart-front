export type CartStatus = 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';

export interface CartItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface Cart {
  id?: number;
  customerId: number;
  customerName?: string;
  status?: CartStatus;
  items?: CartItem[];
  totalAmount?: number;
}

export interface AddItemRequest {
  productId: number;
  quantity: number;
}
