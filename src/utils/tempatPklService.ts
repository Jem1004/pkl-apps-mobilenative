import { useAuthStore } from '@/stores/authStore';

export interface TempatPKL {
  _id: string;
  nama: string;
  alamat?: string;
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
    pagination?: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  };
  error?: string;
}

export interface CreateTempatPKLRequest {
  nama: string;
  alamat?: string;
  kontak?: string;
  email?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface UpdateTempatPKLRequest {
  nama?: string;
  alamat?: string;
  kontak?: string;
  email?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface TempatPKLResponse {
  success: boolean;
  data?: {
    tempat_pkl: TempatPKL;
  };
  message?: string;
  error?: string;
}

export interface BulkImportRequest {
  nama: string;
  alamat?: string;
  kontak?: string;
  email?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface BulkImportResponse {
  success: boolean;
  message?: string;
  data?: {
    success: Array<{
      row: number;
      data: TempatPKL;
    }>;
    errors: Array<{
      row: number;
      data: any;
      error: string;
    }>;
    total: number;
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

/**
 * Get tempat PKL with pagination and filtering
 */
export const getTempatPKL = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<GetTempatPKLResponse> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/tempat-pkl${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
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
    console.error('Get tempat PKL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Create new tempat PKL
 */
export const createTempatPKL = async (data: CreateTempatPKLRequest): Promise<TempatPKLResponse> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/tempat-pkl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Create tempat PKL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Update tempat PKL
 */
export const updateTempatPKL = async (id: string, data: UpdateTempatPKLRequest): Promise<TempatPKLResponse> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/tempat-pkl/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Update tempat PKL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Delete tempat PKL
 */
export const deleteTempatPKL = async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/tempat-pkl/${id}`, {
      method: 'DELETE',
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

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Delete tempat PKL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Bulk import tempat PKL
 */
export const bulkImportTempatPKL = async (data: BulkImportRequest[]): Promise<BulkImportResponse> => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await fetch(`${API_BASE_URL}/tempat-pkl/bulk-import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Bulk import tempat PKL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Generate template for bulk import
 */
export const generateImportTemplate = (): BulkImportRequest[] => {
  return [
    {
      nama: 'Contoh Perusahaan 1',
      alamat: 'Jl. Contoh No. 123, Jakarta',
      kontak: '021-12345678',
      email: 'info@contoh1.com',
      status: 'aktif'
    },
    {
      nama: 'Contoh Perusahaan 2',
      alamat: 'Jl. Contoh No. 456, Bandung',
      kontak: '022-87654321',
      email: 'info@contoh2.com',
      status: 'aktif'
    }
  ];
};

/**
 * Validate import data
 */
export const validateImportData = (data: any[]): { valid: BulkImportRequest[]; errors: Array<{ row: number; error: string }> } => {
  const valid: BulkImportRequest[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  data.forEach((item, index) => {
    const rowNumber = index + 1;
    
    if (!item.nama || typeof item.nama !== 'string' || item.nama.trim() === '') {
      errors.push({
        row: rowNumber,
        error: 'Nama is required and must be a non-empty string'
      });
      return;
    }

    const validItem: BulkImportRequest = {
      nama: item.nama.trim(),
      alamat: item.alamat ? item.alamat.trim() : '',
      kontak: item.kontak ? item.kontak.trim() : '',
      email: item.email ? item.email.trim() : '',
      status: item.status && ['aktif', 'nonaktif'].includes(item.status) ? item.status : 'aktif'
    };

    valid.push(validItem);
  });

  return { valid, errors };
};