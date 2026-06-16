import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { registerActivity, syncAdminState } from '../utils';

export const createOperationsSlice: StateCreator<AppState, [], [], Pick<AppState, 'addOrder' | 'updateOrderStatus' | 'assignMaterialsToOrder'>> = (set, get) => ({
  addOrder: async (order) => {
    set((state) => ({
      ...registerActivity(
        state,
        {
          orders: [
            {
              ...order,
              id: createId('ord'),
              number: `OT-${new Date().getFullYear()}-${String(state.orders.length + 20).padStart(3, '0')}`,
              createdAt: new Date().toISOString(),
            },
            ...state.orders,
          ],
        },
        {
          id: createId('act'),
          type: 'orden',
          customerId: order.customerId,
          description: `Nueva orden creada para ${order.service}.`,
          createdAt: new Date().toISOString(),
        },
      ),
    }));
    await syncAdminState(get, set);
  },

  updateOrderStatus: async (orderId, status, progress) => {
    set((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) return state;

      let nextInventoryMovements = state.inventoryMovements;
      let nextMaterials = state.materials;

      if (status === 'entregado' && order.status !== 'entregado') {
        const consumedMaterials = state.orderMaterials.filter((om) => om.orderId === orderId);
        
        for (const om of consumedMaterials) {
          nextInventoryMovements = [
            {
              id: createId('mov'),
              materialId: om.materialId,
              type: 'salida',
              quantity: om.quantity,
              reason: `Consumo automático por orden ${order.number}`,
              orderId: order.id,
              createdAt: new Date().toISOString()
            },
            ...nextInventoryMovements
          ];
          
          nextMaterials = nextMaterials.map(m => 
            m.id === om.materialId 
              ? { ...m, stock: m.stock - om.quantity }
              : m
          );
        }
      }

      return {
        ...registerActivity(
          state,
          {
            orders: state.orders.map((item) => (item.id === orderId ? { ...item, status, progress } : item)),
            inventoryMovements: nextInventoryMovements,
            materials: nextMaterials,
          },
          {
            id: createId('act'),
            type: 'orden',
            customerId: order.customerId,
            description: `La orden ${order.number} cambió a ${status}.`,
            createdAt: new Date().toISOString(),
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },

  assignMaterialsToOrder: async (orderId, materials) => {
    set((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) return state;

      const newOrderMaterials = materials.map((m) => ({
        id: createId('om'),
        orderId,
        materialId: m.materialId,
        quantity: m.quantity,
      }));

      const filteredOM = state.orderMaterials.filter(om => om.orderId !== orderId);

      return {
        ...registerActivity(
          state,
          {
            orderMaterials: [...newOrderMaterials, ...filteredOM],
          },
          {
            id: createId('act'),
            type: 'orden',
            customerId: order.customerId,
            description: `Materiales asignados a la orden ${order.number}.`,
            createdAt: new Date().toISOString(),
          }
        )
      };
    });
    await syncAdminState(get, set);
  },
});
