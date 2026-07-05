import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { nextDocumentNumber, registerActivity, syncAdminState } from '../utils';

export const createOperationsSlice: StateCreator<AppState, [], [], Pick<AppState, 'addOrder' | 'updateOrderStatus' | 'saveOrderTechnicalData' | 'assignMaterialsToOrder'>> = (set, get) => ({
  addOrder: async (order) => {
    const orderNumber = await nextDocumentNumber('order', get().orders.length + 1);
    set((state) => ({
      ...registerActivity(
        state,
        {
          orders: [
            {
              ...order,
              id: createId('ord'),
              number: orderNumber,
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
      const now = new Date().toISOString();

      if (status === 'entregado' && order.status !== 'entregado') {
        const consumedMaterials = state.orderMaterials.filter((om) => om.orderId === orderId);

        for (const om of consumedMaterials) {
          nextInventoryMovements = [
            {
              id: createId('mov'),
              materialId: om.materialId,
              type: 'salida',
              quantity: om.quantity,
              reason: `Consumo automatico por orden ${order.number}`,
              orderId: order.id,
              createdAt: now,
            },
            ...nextInventoryMovements,
          ];

          nextMaterials = nextMaterials.map((material) => (
            material.id === om.materialId ? { ...material, stock: material.stock - om.quantity } : material
          ));
        }
      }

      return {
        ...registerActivity(
          state,
          {
            orders: state.orders.map((item) => (
              item.id === orderId
                ? {
                    ...item,
                    status,
                    progress,
                    changeLog: [
                      {
                        id: createId('chg'),
                        createdAt: now,
                        author: order.owner || 'Kikeled OS',
                        note: `Estado cambiado de ${order.status} a ${status}.`,
                      },
                      ...(item.changeLog ?? []),
                    ],
                  }
                : item
            )),
            inventoryMovements: nextInventoryMovements,
            materials: nextMaterials,
          },
          {
            id: createId('act'),
            type: 'orden',
            customerId: order.customerId,
            description: `La orden ${order.number} cambio a ${status}.`,
            createdAt: now,
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },

  saveOrderTechnicalData: async (orderId, data) => {
    set((state) => {
      const order = state.orders.find((item) => item.id === orderId);
      if (!order) return state;
      const now = new Date().toISOString();
      const note = data.changeNote?.trim() || 'Ficha tecnica actualizada.';

      return {
        ...registerActivity(
          state,
          {
            orders: state.orders.map((item) => (
              item.id === orderId
                ? {
                    ...item,
                    technicalSheet: { ...data.technicalSheet, updatedAt: now },
                    productionProcesses: data.productionProcesses,
                    qualityControl: data.qualityControl,
                    changeLog: [
                      {
                        id: createId('chg'),
                        createdAt: now,
                        author: data.technicalSheet.elaboradoPor || order.owner || 'Kikeled OS',
                        note,
                      },
                      ...(item.changeLog ?? []),
                    ],
                  }
                : item
            )),
          },
          {
            id: createId('act'),
            type: 'ficha tecnica',
            customerId: order.customerId,
            description: `${note} (${order.number}).`,
            createdAt: now,
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
      const now = new Date().toISOString();

      const newOrderMaterials = materials.map((material) => ({
        id: createId('om'),
        orderId,
        materialId: material.materialId,
        quantity: material.quantity,
      }));

      const filteredOrderMaterials = state.orderMaterials.filter((item) => item.orderId !== orderId);

      return {
        ...registerActivity(
          state,
          {
            orderMaterials: [...newOrderMaterials, ...filteredOrderMaterials],
            orders: state.orders.map((item) => (
              item.id === orderId
                ? {
                    ...item,
                    changeLog: [
                      {
                        id: createId('chg'),
                        createdAt: now,
                        author: order.owner || 'Kikeled OS',
                        note: 'Materiales asignados o actualizados.',
                      },
                      ...(item.changeLog ?? []),
                    ],
                  }
                : item
            )),
          },
          {
            id: createId('act'),
            type: 'orden',
            customerId: order.customerId,
            description: `Materiales asignados a la orden ${order.number}.`,
            createdAt: now,
          },
        ),
      };
    });
    await syncAdminState(get, set);
  },
});