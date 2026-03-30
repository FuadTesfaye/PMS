import { Medicine, Order, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface DataStore {
  users: User[];
  medicines: Medicine[];
  orders: Order[];
}

const initialMedicines: Medicine[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    description: 'Effective pain reliever and fever reducer.',
    price: 12.50,
    stock: 150,
    requiresPrescription: false,
    category: 'Pain Relief',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=260&auto=format&fit=crop',
  },
  {
    id: 'med-2',
    name: 'Amoxicillin 250mg',
    description: 'Broad-spectrum antibiotic for bacterial infections.',
    price: 45.00,
    stock: 45,
    requiresPrescription: true,
    category: 'Antibiotics',
    image: 'https://images.unsplash.com/photo-1471864190281-ad5f9f38d9c6?q=80&w=260&auto=format&fit=crop',
  },
  {
    id: 'med-3',
    name: 'Ibuprofen 400mg',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) for pain.',
    price: 18.25,
    stock: 80,
    requiresPrescription: false,
    category: 'Pain Relief',
    image: 'https://images.unsplash.com/photo-1550572017-ed2001599379?q=80&w=260&auto=format&fit=crop',
  },
  {
    id: 'med-4',
    name: 'Cetirizine 10mg',
    description: 'Antihistamine for allergy relief.',
    price: 22.00,
    stock: 60,
    requiresPrescription: false,
    category: 'Allergy',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=260&auto=format&fit=crop',
  },
  {
    id: 'med-5',
    name: 'Warfarin 5mg',
    description: 'Blood thinner to prevent blood clots.',
    price: 75.00,
    stock: 20,
    requiresPrescription: true,
    category: 'Cardiovascular',
    image: 'https://images.unsplash.com/photo-1628771065518-0d82f1110503?q=80&w=260&auto=format&fit=crop',
  }
];

const initialUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
  },
  {
    id: 'user-2',
    name: 'Pharma Specialist',
    email: 'pharma@example.com',
    password: 'password123',
    role: 'pharmacist',
  },
  {
    id: 'user-3',
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  }
];

// Singleton to prevent data loss on HMR
const globalForStore = globalThis as unknown as {
  store: DataStore | undefined;
};

export const store: DataStore = globalForStore.store ?? {
  users: initialUsers,
  medicines: initialMedicines,
  orders: [],
};

if (process.env.NODE_ENV !== 'production') globalForStore.store = store;

// Helper methods
export const getMedicines = () => store.medicines;
export const getMedicine = (id: string) => store.medicines.find(m => m.id === id);

export const getUsers = () => store.users;
export const getUser = (email: string) => store.users.find(u => u.email === email);

export const getOrders = () => store.orders;
export const getOrder = (id: string) => store.orders.find(o => o.id === id);
export const getOrdersByUser = (userId: string) => store.orders.filter(o => o.userId === userId);
export const getPendingOrders = () => store.orders.filter(o => o.status === 'pending' || o.status === 'reviewing');
export const getLowStockMedicines = (threshold = 10) => store.medicines.filter(m => m.stock <= threshold);

export const getStatistics = () => {
  const totalRevenue = store.orders
    .filter(o => o.status === 'completed' || o.status === 'ready' || o.status === 'approved')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  
  const pendingOrders = store.orders.filter(o => o.status === 'pending' || o.status === 'reviewing').length;
  const lowStockItems = getLowStockMedicines().length;
  
  return {
    totalRevenue,
    pendingOrders,
    lowStockItems,
    totalOrders: store.orders.length,
    totalMedicines: store.medicines.length,
  };
};

export const createOrder = (orderData: Partial<Order>) => {
  const newOrder: Order = {
    id: `order-${uuidv4().slice(0, 8)}`,
    userId: orderData.userId!,
    userName: orderData.userName!,
    items: orderData.items || [],
    totalPrice: orderData.totalPrice || 0,
    status: 'pending',
    prescriptionImage: orderData.prescriptionImage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.orders.unshift(newOrder); // Newest first
  
  // Deduct stock
  newOrder.items.forEach(item => {
    const med = getMedicine(item.medicineId);
    if (med) med.stock -= item.quantity;
  });

  console.log(`[Order Created] ID: ${newOrder.id} by ${newOrder.userName}`);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['status'], note?: string) => {
  const order = getOrder(orderId);
  if (order) {
    order.status = status;
    order.rejectionNote = note;
    order.updatedAt = new Date().toISOString();
    console.log(`[Order Updated] ID: ${orderId} Status: ${status}`);
    return order;
  }
  return null;
};

export const updateMedicine = (id: string, data: Partial<Medicine>) => {
  const index = store.medicines.findIndex(m => m.id === id);
  if (index !== -1) {
    store.medicines[index] = { ...store.medicines[index], ...data };
    return store.medicines[index];
  }
  return null;
};

export const addMedicine = (data: Omit<Medicine, 'id'>) => {
  const newMed: Medicine = {
    ...data,
    id: `med-${uuidv4().slice(0, 8)}`,
  };
  store.medicines.push(newMed);
  return newMed;
};

export const deleteMedicine = (id: string) => {
  const index = store.medicines.findIndex(m => m.id === id);
  if (index !== -1) {
    store.medicines.splice(index, 1);
    return true;
  }
  return false;
};
