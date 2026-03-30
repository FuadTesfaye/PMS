export type UserRole = 'customer' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  requiresPrescription: boolean;
  image: string;
  category: string;
}

export type OrderStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'ready' | 'completed';

export interface OrderItem {
  medicineId: string;
  name: string;
  quantity: number;
  priceAtTime: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  prescriptionImage?: string; // Base64 data URL
  rejectionNote?: string;
  createdAt: string;
  updatedAt: string;
}
