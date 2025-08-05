import { useAuthStore } from '@/stores/authStore';

export interface TempatPKL {
  _id: string;
  nama: string;
  alamat: string;
  kontak?: string;
  email?: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface GetTempatPKLResponse {
  success: boolean;
  data?: {
    tempat_pkl: TempatPKL[];
  };
  error?: string;
}

const API_BASE_URL = '/api';

/**
 * Get all active tempat PKL for dropdown/select
 */
export const getAllTempatPKL = async (): Promise<GetTempatPKLResponse> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/tempat-pkl/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get all tempat PKL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get tempat PKL by ID
 */
export const getTempatPKLById = async (id: string): Promise<GetTempatPKLResponse> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/tempat-pkl/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get tempat PKL by ID error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};