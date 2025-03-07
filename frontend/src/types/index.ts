export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optional since we don't always want to expose it
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  createdBy: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  purchaseOrderId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  createdBy: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details: string;
}