import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { syncAdminState } from '../utils';

export const createInventorySlice: StateCreator<AppState, [], [], Pick<AppState, 'addMaterial' | 'addInventoryMovement'>> = (set, get) => ({
  addMaterial: async (material) => {
    set((state) => ({ materials: [{ ...material, id: createId('mat') }, ...state.materials] }));
    await syncAdminState(get, set);
  },

  addInventoryMovement: async ({ materialId, type, quantity, reason, orderId }) => {
    set((state) => ({
      inventoryMovements: [
        { id: createId('mov'), materialId, type, quantity, reason, orderId, createdAt: new Date().toISOString() },
        ...state.inventoryMovements,
      ],
      materials: state.materials.map((material) =>
        material.id === materialId
          ? { ...material, stock: type === 'entrada' ? material.stock + quantity : material.stock - quantity }
          : material,
      ),
    }));
    await syncAdminState(get, set);
  },
});
