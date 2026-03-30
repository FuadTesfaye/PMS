'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { addMedicine, updateMedicine, deleteMedicine } from '@/lib/store';
import { Medicine } from '@/types';

export async function addMedicineAction(data: Omit<Medicine, 'id'>) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' };
  }

  try {
    const newMed = addMedicine(data);
    revalidatePath('/admin/dashboard');
    revalidatePath('/customer/dashboard');
    return { success: true, medicine: newMed };
  } catch (error) {
    console.error('Failed to add medicine:', error);
    return { error: 'Failed to add medicine' };
  }
}

export async function updateMedicineAction(id: string, data: Partial<Medicine>) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' };
  }

  try {
    const updated = updateMedicine(id, data);
    if (!updated) return { error: 'Medicine not found' };
    revalidatePath('/admin/dashboard');
    revalidatePath('/customer/dashboard');
    return { success: true, medicine: updated };
  } catch (error) {
    console.error('Failed to update medicine:', error);
    return { error: 'Failed to update medicine' };
  }
}

export async function deleteMedicineAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' };
  }

  try {
    const deleted = deleteMedicine(id);
    if (!deleted) return { error: 'Medicine not found' };
    revalidatePath('/admin/dashboard');
    revalidatePath('/customer/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete medicine:', error);
    return { error: 'Failed to delete medicine' };
  }
}
