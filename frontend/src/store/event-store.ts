import { create } from 'zustand';
import { z } from 'zod';
import { eventFormSchema } from '@/lib/schemas';

type EventFormState = z.infer<typeof eventFormSchema>;

interface EventStore {
  eventForm: EventFormState;
  setEventForm: (values: Partial<EventFormState>) => void;
  resetEventForm: () => void;
  editMode: boolean; //  for edit mode
  setEditMode: (mode: boolean) => void; // Function to set edit mode
}

export const useEventStore = create<EventStore>((set) => ({
  eventForm: {
    title: '',
    description: '',
    eventImages: '' ,
    eventType: '',
    location: '',
    locationLink: '',
    startDateTime: new Date(),
    endDateTime: new Date(),
    isFree: false,
    isCanceled: false,
    organizerName: '',
    organizerContact: '',
  },
  setEventForm: (values) =>
    set((state) => ({
      eventForm: { ...state.eventForm, ...values },
    })),
  resetEventForm: () =>
    set({
      eventForm: {
        title: '',
        description: '',
        eventImages: '',
        eventType: '',
        location: '',
        locationLink: '',
        startDateTime: new Date(),
        endDateTime: new Date(),
        isFree: false,
        isCanceled: false,
        organizerName: '',
        organizerContact: '',
      },
    }),
  editMode: false, // Initialize edit mode as false
  setEditMode: (mode) => set({ editMode: mode }), // Function to toggle edit mode
}));
