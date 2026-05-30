import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  init: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  login: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    set({ token: null, user: null });
  },
  init: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        try {
          set({ token, user: JSON.parse(userStr) });
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
  },
}));
