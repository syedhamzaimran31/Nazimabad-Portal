import { create } from "zustand";
import { z } from "zod";
import { announcementFormSchema } from "@/lib/schemas";

type AnnouncementFormState = z.infer<typeof announcementFormSchema>;

interface AnnouncementStore {
  announcementForm: AnnouncementFormState;
  setAnnouncementForm: (values: Partial<AnnouncementFormState>) => void;
  resetAnnouncementForm: () => void;
  editMode: boolean; //  for edit mode
  setEditMode: (mode: boolean) => void; // Function to set edit mode
}

export const useAnnouncementStore = create<AnnouncementStore>((set) => ({
  announcementForm: {
    title: "",
    content: "",
    announcementImage: "",
  },
  setAnnouncementForm: (values) =>
    set((state) => ({
      announcementForm: { ...state.announcementForm, ...values },
    })),
  resetAnnouncementForm: () =>
    set({
      announcementForm: {
        title: "",
        content: "",
        announcementImage: "",
      },
    }),
  editMode: false, // Initialize edit mode as false
  setEditMode: (mode) => set({ editMode: mode }), // Function to toggle edit mode
}));
