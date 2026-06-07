import { create } from 'zustand';

//  Define the logged-in staff structure
export interface UserProfile {
  id: string;
  username: string;
  role: 'CHEF' | 'OWNER';
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Default state: staff is unauthenticated on fresh load
  isLoggedIn: false,
  user: null,

  //  Triggered after a successful 200 OK post response from /api/auth/login
  login: (profile) => set({
    isLoggedIn: true,
    user: profile,
  }),

  //  Wipes the local store memory clean upon signing out
  logout: () => set({
    isLoggedIn: false,
    user: null,
  }),
}));