/**
 * Authentication Store using Zustand
 * Manages user authentication state and API calls
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  _id: string;
  nama: string;
  username: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  nis?: string;
  nip?: string;
  kelas?: string;
  status: 'aktif' | 'nonaktif';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  getProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      getProfile: async () => {
        try {
          const { token } = get();
          if (!token) {
            throw new Error('No authentication token available');
          }

          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          // Check if response is ok first
          if (!response.ok) {
            // Handle different HTTP status codes
            if (response.status === 401) {
              // Token expired or invalid, logout user
              set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Session expired. Please login again.',
              });
              throw new Error('Session expired');
            } else if (response.status === 404) {
              throw new Error('User profile not found');
            } else if (response.status === 500) {
              throw new Error('Server error. Please try again later.');
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
          }

          // Check if response has content
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response format from server');
          }

          const data = await response.json();

          // Validate response structure
          if (!data || !data.success || !data.data || !data.data.user) {
            throw new Error(data?.error || 'Invalid profile data received');
          }

          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Get profile error:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to get profile',
          });
          
          // Don't throw error if it's a network issue, just log it
          if (error instanceof Error && error.message.includes('fetch')) {
            console.warn('Network error getting profile, user may be offline');
            return;
          }
          
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          const { token } = get();
          if (!token) throw new Error('No token available');

          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Failed to update profile');
          }

          set({
            user: result.data.user,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update profile',
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          const { token } = get();
          if (!token) throw new Error('No token available');

          set({ isLoading: true, error: null });

          const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
          }

          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to change password',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);