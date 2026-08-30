import { create } from 'zustand';
import api from '../lib/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  targetRole?: string | null;
  degreeName?: string | null;
  currentSemester: number;
  gpa?: number | null;
  role: 'STUDENT' | 'ADMIN';
  createdAt?: string;
  _count?: {
    documents: number;
    courses: number;
    tasks: number;
  };
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    targetRole?: string;
    degreeName?: string;
    currentSemester?: number;
    gpa?: number;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initializeAuth: async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem('alter_token');
      const cachedUser = localStorage.getItem('alter_user');

      if (token && cachedUser) {
        set({
          token,
          user: JSON.parse(cachedUser),
          isAuthenticated: true,
          isLoading: false,
        });

        // Refresh profile from server
        try {
          const res = await api.get('/user/profile');
          if (res.data?.success && res.data?.user) {
            set({ user: res.data.user });
            localStorage.setItem('alter_user', JSON.stringify(res.data.user));
          }
        } catch {
          // Token may be expired, let interceptor handle
        }
      } else {
        set({ isLoading: false, isAuthenticated: false, user: null, token: null });
      }
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('alter_token', token);
        localStorage.setItem('alter_user', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem('alter_token', token);
        localStorage.setItem('alter_user', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alter_token');
      localStorage.removeItem('alter_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/user/profile', data);
      if (res.data.success) {
        const updated = { ...get().user, ...res.data.user };
        set({ user: updated });
        localStorage.setItem('alter_user', JSON.stringify(updated));
        return true;
      }
      return false;
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to update profile' });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
