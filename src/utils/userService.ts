/**
 * User Service - API integration for user management
 * Handles all CRUD operations for users
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

export interface UserData {
  _id: string;
  nama: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  nis?: string;
  nip?: string;
  kelas?: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  nama: string;
  email: string;
  password: string;
  role: 'admin' | 'guru' | 'siswa';
  nis?: string;
  nip?: string;
  kelas?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface UpdateUserData {
  nama?: string;
  email?: string;
  role?: 'admin' | 'guru' | 'siswa';
  nis?: string;
  nip?: string;
  kelas?: string;
  status?: 'aktif' | 'nonaktif';
}

export interface UsersResponse {
  users: UserData[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
  kelas?: string;
}

// Get authorization header
const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      const authToken = parsed.state?.token;
      if (authToken) {
        return {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
  }
  return {
    'Content-Type': 'application/json'
  };
};

// Get all users with pagination and filtering
export const getUsers = async (params: GetUsersParams = {}): Promise<ApiResponse<UsersResponse>> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch users'
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Get users error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<ApiResponse<{ user: UserData }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
      headers: getAuthHeader()
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to fetch user'
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Get user by ID error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Create new user
export const createUser = async (userData: CreateUserData): Promise<ApiResponse<{ user: UserData }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create user',
        details: result.details
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Update user
export const updateUser = async (id: string, userData: UpdateUserData): Promise<ApiResponse<{ user: UserData }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to update user',
        details: result.details
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Delete user
export const deleteUser = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete user'
      };
    }

    return {
      success: true,
      message: result.message
    };
  } catch (error) {
    console.error('Delete user error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Reset user password
export const resetUserPassword = async (id: string, newPassword: string): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ newPassword })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to reset password'
      };
    }

    return {
      success: true,
      message: result.message
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Import users from CSV (bulk import)
export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export const importUsersFromCSV = async (users: CreateUserData[]): Promise<ApiResponse<ImportResult>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/import-csv`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ users })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to import users from CSV'
      };
    }

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Import users from CSV error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};

// Export users to Excel
export const exportUsers = async (params: GetUsersParams = {}): Promise<ApiResponse<Blob>> => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/users/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader().Authorization || ''
      }
    });

    if (!response.ok) {
      const result = await response.json();
      return {
        success: false,
        error: result.error || 'Failed to export users'
      };
    }

    const blob = await response.blob();
    return {
      success: true,
      data: blob
    };
  } catch (error) {
    console.error('Export users error:', error);
    return {
      success: false,
      error: 'Network error occurred'
    };
  }
};