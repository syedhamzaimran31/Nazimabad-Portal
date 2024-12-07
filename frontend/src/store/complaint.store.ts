import { create } from 'zustand';
import { z } from 'zod';
import { complaintAdminFormSchema, complaintFormScema } from '@/lib/schemas';

type ComplaintFormState = z.infer<typeof complaintFormScema>;
type ComplaintAdminFormState = z.infer<typeof complaintAdminFormSchema>;

interface ComplaintAdminStore {
  complaintAdminForm: ComplaintAdminFormState;
  setComplaintAdminForm: (values: Partial<ComplaintAdminFormState>) => void;
  resetComplaintAdminForm: () => void;
}

interface ComplaintStore {
  complaintForm: ComplaintFormState;
  setComplaintForm: (values: Partial<ComplaintFormState>) => void;
  resetComplaintForm: () => void;
  editMode: boolean; //  for edit mode
  setEditMode: (mode: boolean) => void; // Function to set edit mode
}

export const useComplaintStore = create<ComplaintStore>((set) => ({
  complaintForm: {
    complaint: '',
    description: '',
    complaintType: '',
    complaintImage: '',
  },
  setComplaintForm: (values) =>
    set((state) => ({
      complaintForm: { ...state.complaintForm, ...values },
    })),
  resetComplaintForm: () =>
    set({
      complaintForm: {
        complaint: '',
        description: '',
        complaintType: '',
        complaintImage: '',
      },
    }),
  editMode: false, // Initialize edit mode as false
  setEditMode: (mode) => set({ editMode: mode }), // Function to toggle edit mode
}));

export const useComplaintAdminStore = create<ComplaintAdminStore>((set) => ({
  complaintAdminForm: {
    response: '',
    complaintStatus: '',
  },
  setComplaintAdminForm: (values) =>
    set((state) => ({
      complaintAdminForm: { ...state.complaintAdminForm, ...values },
    })),
  resetComplaintAdminForm: () =>
    set({
      complaintAdminForm: {
        response: '',
        complaintStatus: '',
      },
    }),
}));
