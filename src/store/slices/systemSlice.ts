import { StateCreator } from 'zustand';
import { emptyData } from '../../data/empty';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { syncAdminState } from '../utils';

export const createSystemSlice: StateCreator<AppState, [], [], Pick<AppState, 'resetDemo' | 'addServiceCategory' | 'addService' | 'updateService'>> = (set, get) => ({
  addServiceCategory: async (category) => {
    const id = createId('cat');
    set((state) => ({
      serviceCategories: [
        ...state.serviceCategories,
        {
          id,
          name: category.name.trim(),
        },
      ],
    }));
    await syncAdminState(get, set);
    return id;
  },

  addService: async (service) => {
    const id = createId('srv');
    set((state) => ({
      services: [
        {
          ...service,
          id,
          name: service.name.trim(),
          description: service.description.trim(),
          calculationType: service.calculationType.trim(),
          image: service.image.trim() || 'custom-service',
          suggestedMaterials: service.suggestedMaterials.map((item) => item.trim()).filter(Boolean),
        },
        ...state.services,
      ],
    }));
    await syncAdminState(get, set);
    return id;
  },

  updateService: async (serviceId, patch) => {
    set((state) => ({
      services: state.services.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              ...patch,
              name: patch.name?.trim() ?? service.name,
              description: patch.description?.trim() ?? service.description,
              calculationType: patch.calculationType?.trim() ?? service.calculationType,
              image: patch.image?.trim() || service.image,
              suggestedMaterials: patch.suggestedMaterials?.map((item) => item.trim()).filter(Boolean) ?? service.suggestedMaterials,
            }
          : service,
      ),
    }));
    await syncAdminState(get, set);
  },

  resetDemo: async () => {
    if (get().sessionUser?.roleKind !== 'admin') return;
    set({ ...emptyData });
    await syncAdminState(get, set);
  },
});
