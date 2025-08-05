import { create } from 'zustand';
import {
  TempatPKL,
  getTempatPKL,
  getAllTempatPKL,
  getTempatPKLById,
  createTempatPKL,
  updateTempatPKL,
  deleteTempatPKL,
  bulkImportTempatPKL,
  CreateTempatPKLRequest,
  UpdateTempatPKLRequest,
  BulkImportRequest,
  BulkImportResponse
} from '@/utils/tempatPklService';

interface TempatPKLState {
  // State
  tempatPKLList: TempatPKL[];
  allTempatPKL: TempatPKL[];
  selectedTempatPKL: TempatPKL | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  searchQuery: string;
  statusFilter: string;
  
  // Actions
  fetchTempatPKL: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => Promise<void>;
  fetchAllTempatPKL: () => Promise<void>;
  fetchTempatPKLById: (id: string) => Promise<void>;
  createNewTempatPKL: (data: CreateTempatPKLRequest) => Promise<boolean>;
  updateExistingTempatPKL: (id: string, data: UpdateTempatPKLRequest) => Promise<boolean>;
  deleteExistingTempatPKL: (id: string) => Promise<boolean>;
  bulkImportNewTempatPKL: (data: BulkImportRequest[]) => Promise<BulkImportResponse>;
  
  // Utility actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
  clearSelectedTempatPKL: () => void;
}

export const useTempatPKLStore = create<TempatPKLState>((set, get) => ({
  // Initial state
  tempatPKLList: [],
  allTempatPKL: [],
  selectedTempatPKL: null,
  loading: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
  
  // Filters
  searchQuery: '',
  statusFilter: '',
  
  // Actions
  fetchTempatPKL: async (params) => {
    set({ loading: true, error: null });
    
    try {
      const response = await getTempatPKL(params);
      
      if (response.success && response.data) {
        set({
          tempatPKLList: response.data.tempat_pkl,
          currentPage: response.data.pagination?.current_page || 1,
          totalPages: response.data.pagination?.total_pages || 0,
          totalItems: response.data.pagination?.total_items || 0,
          itemsPerPage: response.data.pagination?.items_per_page || 10,
          loading: false
        });
      } else {
        set({
          error: response.error || 'Failed to fetch tempat PKL',
          loading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      });
    }
  },
  
  fetchAllTempatPKL: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await getAllTempatPKL();
      
      if (response.success && response.data) {
        set({
          allTempatPKL: response.data.tempat_pkl,
          loading: false
        });
      } else {
        set({
          error: response.error || 'Failed to fetch all tempat PKL',
          loading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      });
    }
  },
  
  fetchTempatPKLById: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await getTempatPKLById(id);
      
      if (response.success && response.data) {
        set({
          selectedTempatPKL: response.data.tempat_pkl[0] || null,
          loading: false
        });
      } else {
        set({
          error: response.error || 'Failed to fetch tempat PKL',
          loading: false
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      });
    }
  },
  
  createNewTempatPKL: async (data: CreateTempatPKLRequest) => {
    set({ loading: true, error: null });
    
    try {
      const response = await createTempatPKL(data);
      
      if (response.success) {
        // Refresh the list after creating
        const { currentPage, itemsPerPage, searchQuery, statusFilter } = get();
        await get().fetchTempatPKL({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          status: statusFilter || undefined
        });
        
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.error || 'Failed to create tempat PKL',
          loading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      });
      return false;
    }
  },
  
  updateExistingTempatPKL: async (id: string, data: UpdateTempatPKLRequest) => {
    set({ loading: true, error: null });
    
    try {
      const response = await updateTempatPKL(id, data);
      
      if (response.success) {
        // Refresh the list after updating
        const { currentPage, itemsPerPage, searchQuery, statusFilter } = get();
        await get().fetchTempatPKL({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          status: statusFilter || undefined
        });
        
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.error || 'Failed to update tempat PKL',
          loading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      });
      return false;
    }
  },
  
  deleteExistingTempatPKL: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await deleteTempatPKL(id);
      
      if (response.success) {
        // Refresh the list after deleting
        const { currentPage, itemsPerPage, searchQuery, statusFilter } = get();
        await get().fetchTempatPKL({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          status: statusFilter || undefined
        });
        
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.error || 'Failed to delete tempat PKL',
          loading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        loading: false
      });
      return false;
    }
  },
  
  // Utility actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
  
  setStatusFilter: (status: string) => {
    set({ statusFilter: status });
  },
  
  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  clearSelectedTempatPKL: () => {
    set({ selectedTempatPKL: null });
  },

  bulkImportNewTempatPKL: async (data: BulkImportRequest[]) => {
    set({ loading: true, error: null });
    
    try {
      const response = await bulkImportTempatPKL(data);
      
      if (response.success || (response.data && response.data.success.length > 0)) {
        // Refresh the list after importing
        const { currentPage, itemsPerPage, searchQuery, statusFilter } = get();
        await get().fetchTempatPKL({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          status: statusFilter || undefined
        });
        
        set({ loading: false });
        return response;
      } else {
        set({
          error: response.error || 'Failed to import tempat PKL',
          loading: false
        });
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      set({
        error: errorMessage,
        loading: false
      });
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}));