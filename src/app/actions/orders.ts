'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { createOrder, updateOrderStatus, getMedicine } from '@/lib/store';
import { OrderItem, OrderStatus } from '@/types';

export async function placeOrder(items: OrderItem[], totalPrice: number, prescriptionImage?: string) {
  const session = await getSession();
  if (!session || session.role !== 'customer') {
    return { error: 'Unauthorized' };
  }

  // Validate stock before placing order
  for (const item of items) {
    const med = getMedicine(item.medicineId);
    if (!med || med.stock < item.quantity) {
      return { error: `Insufficient stock for ${med?.name || 'unknown medicine'}` };
    }
  }

  try {
    const order = createOrder({
      userId: session.id,
      userName: session.name,
      items,
      totalPrice,
      prescriptionImage,
    });

    revalidatePath('/customer/dashboard');
    revalidatePath('/pharmacist/dashboard');
    revalidatePath('/admin/dashboard');

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error('Order creation failed:', error);
    return { error: 'Failed to place order' };
  }
}

export async function updateOrderAction(orderId: string, status: OrderStatus, note?: string) {
  const session = await getSession();
  if (!session || (session.role !== 'pharmacist' && session.role !== 'admin')) {
    return { error: 'Unauthorized' };
  }

  try {
    const updated = updateOrderStatus(orderId, status, note);
    if (!updated) return { error: 'Order not found' };

    revalidatePath('/customer/dashboard');
    revalidatePath('/pharmacist/dashboard');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Order update failed:', error);
    return { error: 'Failed to update order' };
  }
}
