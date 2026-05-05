import { create } from "zustand";

type AuthUiState = {
  tab: "signin" | "register";
  loginNextPath: string | null;
  lastConflictNotice: string | null;
  setTab: (tab: "signin" | "register") => void;
  setLoginNextPath: (path: string | null) => void;
  setLastConflictNotice: (message: string | null) => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  tab: "signin",
  loginNextPath: null,
  lastConflictNotice: null,
  setTab: (tab) => set({ tab }),
  setLoginNextPath: (loginNextPath) => set({ loginNextPath }),
  setLastConflictNotice: (lastConflictNotice) => set({ lastConflictNotice }),
}));
