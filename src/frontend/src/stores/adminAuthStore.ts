import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminAuthState {
  adminToken: string | null;
  adminEmail: string | null;
  isAdminAuthenticated: boolean;
  setAdminAuth: (token: string, email: string) => void;
  clearAdminAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      adminEmail: null,
      isAdminAuthenticated: false,
      setAdminAuth: (token, email) =>
        set({
          adminToken: token,
          adminEmail: email,
          isAdminAuthenticated: true,
        }),
      clearAdminAuth: () =>
        set({
          adminToken: null,
          adminEmail: null,
          isAdminAuthenticated: false,
        }),
    }),
    {
      name: "admin-auth-storage",
    },
  ),
);
