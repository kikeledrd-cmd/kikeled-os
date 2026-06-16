import { StateCreator } from 'zustand';
import { createId } from '../../lib/utils';
import { AppState } from '../types';
import { registerActivity, syncAdminState } from '../utils';

export const createAttachmentsSlice: StateCreator<AppState, [], [], Pick<AppState, 'addAttachment'>> = (set, get) => ({
  addAttachment: async (attachment) => {
    set((state) => ({
      ...registerActivity(
        state,
        {
          attachments: [
            {
              ...attachment,
              id: createId('att'),
            },
            ...state.attachments,
          ],
        },
        {
          id: createId('act'),
          type: 'crm',
          customerId: attachment.customerId,
          description: `Archivo "${attachment.name}" adjuntado.`,
          createdAt: new Date().toISOString(),
        },
      ),
    }));
    await syncAdminState(get, set);
  },
});
