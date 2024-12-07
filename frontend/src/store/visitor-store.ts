import { create } from 'zustand';
import { z } from 'zod';
import { visitorFormSchema } from '@/lib/schemas';

type VisitorFormState = z.infer<typeof visitorFormSchema>;

interface VisitorStore {
  visitorForm: VisitorFormState;
  setVisitorForm: (values: Partial<VisitorFormState>) => void;
  resetVisitorForm: () => void;
  editMode: boolean; //  for edit mode
  setEditMode: (mode: boolean) => void; // Function to set edit mode
}

export const useVisitorStore = create<VisitorStore>((set) => ({
  visitorForm: {
    vehicleType: '',
    numberPlate: '',
    numberOfPersons: 1,
    visitDate: new Date(),
    persons: [{ name: '', cnic: '', cnicImage: '' }],
  },
  setVisitorForm: (values) =>
    set((state) => ({
      visitorForm: { ...state.visitorForm, ...values },
    })),
  resetVisitorForm: () =>
    set((state) => ({
      visitorForm: {
        ...state.visitorForm,
        vehicleType: '',
        numberPlate: '',
        numberOfPersons: state.visitorForm.numberOfPersons,
        visitDate: new Date(),
        persons: [{ name: '', cnic: '', cnicImage: '' }],
      },
    })),
  editMode: false, // Initialize edit mode as false
  setEditMode: (mode) => set({ editMode: mode }), // Function to toggle edit mode
}));
