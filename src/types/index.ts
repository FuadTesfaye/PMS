export type UserRole = "pharmacy" | "pharmacist" | "admin" | "distributor" | "sales_rep";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pharmacyId?: string | null;
}

export interface Medicine {
  id: string;
  name: string;
  brand: string;
  supplier: string;
  description: string;
  price: number;
  stock: number;
  requiresPrescription: boolean;
  expiryDate: string;
  batchNumber: string;
  category: string;
  image?: string;
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
  pharmacyId: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalPrice: number; // mapped from DB "total"
  status: OrderStatus;
  prescriptionImage?: string;
  rejectionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldReport {
  id: string;
  salesRepId: string;
  pharmacyId: string;
  notes: string;
  competitorInfo: string;
  stockObservation: string;
  createdAt: string;
}
