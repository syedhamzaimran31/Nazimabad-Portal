import { userType } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type State = {
  user: userType | null;
  role: string; // Stores the user's role from the API response
};

export type Actions = {
  setUser: (user: userType | null) => void;
  setRole: (role: string) => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist<State & Actions>(
    (set) => ({
      role: '',
      setRole: (role) => set({ role }),
      user: null, // Stores the user object

      setUser: (userData) => {
        if (userData) {
          console.log('Setting user in Zustand:', userData);
          set({ user: userData, role: userData.roles[0] });
        }
      }, // Function to set user data

      logout: () => set({ user: null, role: '' }), // Function to log out
    }),
    {
      name: 'auth-storage', // Unique name for localStorage key
      getStorage: () => localStorage, // Use localStorage for persistence
    },
  ),
);
