import { StateCreator } from 'zustand';
import { emptyData } from '../../data/empty';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { syncAdminState } from '../utils';

export const createSystemSlice: StateCreator<
  AppState,
  [],
  [],
  Pick<AppState, 'resetDemo' | 'addServiceCategory' | 'addService' | 'updateService' | 'upsertHeroSlide' | 'deleteHeroSlide' | 'upsertWebProduct' | 'deleteWebProduct'>
> = (set, get) => ({
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

  upsertHeroSlide: async (slide) => {
    const now = new Date().toISOString();
    set((state) => {
      const exists = state.heroSlides.some((item) => item.id === slide.id);
      const nextSlide = {
        ...slide,
        title: slide.title.trim(),
        subtitle: slide.subtitle?.trim(),
        mediaUrl: slide.mediaUrl.trim(),
        thumbnailUrl: slide.thumbnailUrl?.trim(),
        ctaLabel: slide.ctaLabel?.trim(),
        ctaUrl: slide.ctaUrl?.trim(),
        badge: slide.badge?.trim(),
        updatedAt: now,
        createdAt: slide.createdAt || now,
      };
      return {
        heroSlides: exists
          ? state.heroSlides.map((item) => (item.id === slide.id ? nextSlide : item))
          : [...state.heroSlides, nextSlide],
      };
    });
    await syncAdminState(get, set);
  },

  deleteHeroSlide: async (slideId) => {
    set((state) => ({ heroSlides: state.heroSlides.filter((slide) => slide.id !== slideId) }));
    await syncAdminState(get, set);
  },

  upsertWebProduct: async (product) => {
    const now = new Date().toISOString();
    set((state) => {
      const exists = state.webProducts.some((item) => item.id === product.id);
      const nextProduct = {
        ...product,
        name: product.name.trim(),
        slug: product.slug.trim(),
        category: product.category.trim(),
        shortDescription: product.shortDescription.trim(),
        description: product.description?.trim(),
        thumbnailUrl: product.thumbnailUrl?.trim(),
        ctaLabel: product.ctaLabel?.trim(),
        materials: product.materials?.map((item) => item.trim()).filter(Boolean),
        sizes: product.sizes?.map((item) => item.trim()).filter(Boolean),
        details: product.details?.map((item) => item.trim()).filter(Boolean),
        updatedAt: now,
        createdAt: product.createdAt || now,
      };
      return {
        webProducts: exists
          ? state.webProducts.map((item) => (item.id === product.id ? nextProduct : item))
          : [...state.webProducts, nextProduct],
      };
    });
    await syncAdminState(get, set);
  },

  deleteWebProduct: async (productId) => {
    set((state) => ({ webProducts: state.webProducts.filter((product) => product.id !== productId) }));
    await syncAdminState(get, set);
  },

  resetDemo: async () => {
    if (get().sessionUser?.roleKind !== 'admin') return;
    set({ ...emptyData });
    await syncAdminState(get, set);
  },
});
