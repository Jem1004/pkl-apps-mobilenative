import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  UserPlus,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  Upload,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUsers,
  importUsersFromCSV,
  type UserData,
  type CreateUserData,
  type UpdateUserData,
  type GetUsersParams,
  type ImportResult
} from '@/utils/userService';


// Use UserData from service instead of local interface
type User = UserData;

interface UserFormData {
  nama: string;
  email?: string; // Made optional
  password?: string;
  role: 'admin' | 'guru' | 'siswa';
  status: 'aktif' | 'nonaktif';
  kelas?: string;
}

interface FormErrors {
  nama?: string;
  email?: string;
  password?: string;
  role?: string;
  kelas?: string;
}

// Mock data untuk development
const mockUsers: User[] = [
  {
    _id: '1',
    nama: 'Admin Utama',
    email: 'admin@sekolah.com',
    role: 'admin',
    status: 'aktif',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    _id: '2',
    nama: 'Budi Santoso',
    email: 'budi.guru@sekolah.com',
    role: 'guru',
    status: 'aktif',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z'
  },
  {
    _id: '3',
    nama: 'Siti Nurhaliza',
    email: 'siti.siswa@sekolah.com',
    role: 'siswa',
    status: 'aktif',
    kelas: 'XII RPL 1',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-05T08:00:00Z'
  },
  {
    _id: '4',
    nama: 'Ahmad Wijaya',
    email: 'ahmad.siswa@sekolah.com',
    role: 'siswa',
    status: 'nonaktif',
    kelas: 'XII RPL 2',
    created_at: '2024-01-03T08:00:00Z',
    updated_at: '2024-01-03T08:00:00Z'
  }
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    nama: '',
    email: '',
    password: '',
    role: 'siswa',
    status: 'aktif',
    kelas: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [apiTotalPages, setApiTotalPages] = useState(0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);



  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const params: GetUsersParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await getUsers(params);
      
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalUsers(response.data.pagination.total_items);
        setApiTotalPages(response.data.pagination.total_pages);
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data on error
      setUsers(mockUsers);
      setTotalUsers(mockUsers.length);
      setApiTotalPages(Math.ceil(mockUsers.length / itemsPerPage));
      toast.error('Gagal memuat data pengguna, menggunakan data contoh');
    } finally {
      setIsLoading(false);
    }
  };



  // Filtering is now done server-side via API parameters
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Set filtered users to current users since filtering is done server-side
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Pagination calculations - using API pagination
  const totalPages = apiTotalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers);
  const paginatedUsers = users; // Users are already paginated from API
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'guru': return 'bg-blue-100 text-blue-800';
      case 'siswa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'aktif' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    
    try {
      const response = await deleteUser(userToDelete._id);
      
      if (response.success) {
        toast.success(response.message || `Pengguna ${userToDelete.nama} berhasil dihapus`);
        fetchUsers(); // Refresh data
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        toast.error(response.error || 'Gagal menghapus pengguna');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Terjadi kesalahan saat menghapus pengguna');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user._id === userId 
        ? { ...user, status: user.status === 'aktif' ? 'nonaktif' : 'aktif' }
        : user
    ));
    toast.success('Status pengguna berhasil diubah');
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.nama.trim()) {
      errors.nama = 'Nama wajib diisi';
    }

    // Email is now optional, but if provided, must be valid and unique
    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Format email tidak valid';
      } else {
        // Check if email already exists (exclude current user in edit mode)
        const existingUser = users.find(user => 
          user.email === formData.email && (!isEditMode || user._id !== selectedUser?._id)
        );
        if (existingUser) {
          errors.email = 'Email sudah digunakan';
        }
      }
    }

    if (!isEditMode && !formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    if (formData.role === 'siswa' && !formData.kelas?.trim()) {
      errors.kelas = 'Kelas wajib diisi untuk siswa';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      email: '',
      password: '',
      role: 'siswa',
      status: 'aktif',
      kelas: ''
    });
    setFormErrors({});
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      nama: user.nama,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      kelas: user.kelas || ''
    });
    setSelectedUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && selectedUser) {
        // Update user
        const updateData: UpdateUserData = {
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
          status: formData.status
        };
        
        if (formData.role === 'siswa') {
          updateData.kelas = formData.kelas;
        }
        
        const response = await updateUser(selectedUser._id, updateData);
        
        if (response.success) {
          toast.success(response.message || 'Pengguna berhasil diperbarui!');
          fetchUsers(); // Refresh data
          closeModal();
        } else {
          toast.error(response.error || 'Gagal memperbarui pengguna');
        }
      } else {
        // Create new user
        const createData: CreateUserData = {
          nama: formData.nama,
          email: formData.email,
          password: formData.password!,
          role: formData.role,
          status: formData.status
        };
        
        if (formData.role === 'siswa') {
          createData.kelas = formData.kelas;
        }
        
        const response = await createUser(createData);
        
        if (response.success) {
          toast.success(response.message || 'Pengguna berhasil ditambahkan!');
          fetchUsers(); // Refresh data
          closeModal();
        } else {
          toast.error(response.error || 'Gagal menambahkan pengguna');
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const exportToCSV = async () => {
    try {
      setIsLoading(true);
      
      const params: GetUsersParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await exportUsers(params);
      
      if (response.success && response.data) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(response.data);
        link.setAttribute('href', url);
        link.setAttribute('download', `data-pengguna-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Data berhasil diekspor');
      } else {
        // Fallback to client-side CSV generation
        const headers = ['Nama', 'Email', 'Role', 'Status', 'Kelas', 'Tanggal Dibuat'];
         const csvData = filteredUsers.map(user => [
           user.nama,
           user.email,
           user.role,
           user.status === 'aktif' ? 'Aktif' : 'Tidak Aktif',
           user.kelas || '-',
           new Date(user.created_at).toLocaleDateString('id-ID')
         ]);

        const csvContent = [headers, ...csvData]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `data-pengguna-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Data berhasil diekspor ke CSV');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    await exportToCSV(); // Use the same export function
  };

  // CSV Import Functions
  const downloadCsvTemplate = () => {
    const headers = ['nama', 'email', 'password', 'role', 'kelas'];
    const sampleData = [
      'John Doe',
      'john.doe@example.com',
      'password123',
      'siswa',
      'XII RPL 1'
    ];
    
    const csvContent = [headers, sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template-import-siswa.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Template CSV berhasil diunduh');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('File harus berformat CSV');
        return;
      }
      setCsvFile(file);
    }
  };

  const parseCsvFile = (file: File): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const data = lines.map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const validateCsvData = (data: string[][]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const headers = data[0];
    const requiredHeaders = ['nama', 'email', 'password', 'role'];
    
    // Check headers
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        errors.push(`Header '${header}' tidak ditemukan`);
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Validate data rows
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;
      
      if (row.length !== headers.length) {
        errors.push(`Baris ${rowNum}: Jumlah kolom tidak sesuai`);
        continue;
      }
      
      const namaIndex = headers.indexOf('nama');
      const emailIndex = headers.indexOf('email');
      const passwordIndex = headers.indexOf('password');
      const roleIndex = headers.indexOf('role');
      
      if (!row[namaIndex]?.trim()) {
        errors.push(`Baris ${rowNum}: Nama tidak boleh kosong`);
      }
      
      if (!row[emailIndex]?.trim()) {
        errors.push(`Baris ${rowNum}: Email tidak boleh kosong`);
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[emailIndex])) {
        errors.push(`Baris ${rowNum}: Format email tidak valid`);
      }
      
      if (!row[passwordIndex]?.trim()) {
        errors.push(`Baris ${rowNum}: Password tidak boleh kosong`);
      }
      
      if (!['admin', 'guru', 'siswa'].includes(row[roleIndex])) {
        errors.push(`Baris ${rowNum}: Role harus admin, guru, atau siswa`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  const importCsvData = async () => {
    if (!csvFile) {
      toast.error('Pilih file CSV terlebih dahulu');
      return;
    }
    
    try {
      setIsImporting(true);
      setImportProgress(0);
      setImportResults({ success: 0, failed: 0, errors: [] });
      
      const csvData = await parseCsvFile(csvFile);
      const validation = validateCsvData(csvData);
      
      if (!validation.valid) {
        setImportResults({
          success: 0,
          failed: csvData.length - 1,
          errors: validation.errors
        });
        return;
      }
      
      const headers = csvData[0];
      const dataRows = csvData.slice(1);
      
      // Prepare user data for bulk import
      const usersData: CreateUserData[] = dataRows.map((row, index) => {
        const userData: CreateUserData = {
          nama: row[headers.indexOf('nama')].trim(),
          email: row[headers.indexOf('email')].trim(),
          password: row[headers.indexOf('password')].trim(),
          role: row[headers.indexOf('role')] as 'admin' | 'guru' | 'siswa',
          status: 'aktif'
        };
        
        // Add optional fields
        const nisIndex = headers.indexOf('nis');
        if (nisIndex !== -1 && row[nisIndex]?.trim()) {
          userData.nis = row[nisIndex].trim();
        }
        
        const nipIndex = headers.indexOf('nip');
        if (nipIndex !== -1 && row[nipIndex]?.trim()) {
          userData.nip = row[nipIndex].trim();
        }
        
        const kelasIndex = headers.indexOf('kelas');
        if (kelasIndex !== -1 && row[kelasIndex]?.trim()) {
          userData.kelas = row[kelasIndex].trim();
        }
        
        // tempat_pkl field removed from User model
        
        return userData;
      });
      
      setImportProgress(50); // Show progress
      
      // Call bulk import API
      const response = await importUsersFromCSV(usersData);
      
      setImportProgress(100);
      
      if (response.success && response.data) {
        setImportResults(response.data);
        
        if (response.data.success > 0) {
          fetchUsers(); // Refresh user list
          toast.success(`Berhasil mengimpor ${response.data.success} pengguna`);
        }
        
        if (response.data.failed > 0) {
          toast.error(`${response.data.failed} pengguna gagal diimpor`);
        }
      } else {
        toast.error(response.error || 'Gagal mengimpor data');
        setImportResults({ success: 0, failed: usersData.length, errors: [response.error || 'Import failed'] });
      }
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Terjadi kesalahan saat mengimpor data');
      setImportResults({ success: 0, failed: 0, errors: ['Gagal memproses file CSV'] });
    } finally {
      setIsImporting(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setCsvFile(null);
    setImportProgress(0);
    setImportResults(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pengguna...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola semua pengguna sistem PKL</p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
            <button
              onClick={downloadCsvTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Template CSV
            </button>
            
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        exportToCSV();
                        setIsExportDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export ke CSV
                    </button>
                    <button
                      onClick={() => {
                        exportToExcel();
                        setIsExportDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export ke Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={openCreateModal}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Guru</p>
                <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'guru').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'siswa').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Tidak Aktif</option>
            </select>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas/Tempat PKL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Dibuat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nama}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusBadgeColor(user.status)}`}
                      >
                        {user.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.kelas || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openViewModal(user)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title="Edit Pengguna"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada pengguna</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Tidak ada pengguna yang sesuai dengan filter.'
                  : 'Belum ada pengguna yang terdaftar.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalUsers > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                  <span className="font-medium">{Math.min(endIndex, totalUsers)}</span> dari{' '}
                  <span className="font-medium">{totalUsers}</span> hasil
                </p>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={5}>5 per halaman</option>
                  <option value={10}>10 per halaman</option>
                  <option value={25}>25 per halaman</option>
                  <option value={50}>50 per halaman</option>
                </select>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nama ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {formErrors.nama && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.nama}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-gray-500 text-xs">(opsional - akan dibuat otomatis jika kosong)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan email (opsional)"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!isEditMode && '*'}
                    {isEditMode && <span className="text-gray-500 text-xs">(kosongkan jika tidak ingin mengubah)</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={isEditMode ? "Masukkan password baru" : "Masukkan password"}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as 'admin' | 'guru' | 'siswa')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Kelas (only for siswa) */}
                {formData.role === 'siswa' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas *
                    </label>
                    <input
                      type="text"
                      value={formData.kelas}
                      onChange={(e) => handleInputChange('kelas', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.kelas ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Contoh: XII RPL 1"
                    />
                    {formErrors.kelas && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {formErrors.kelas}
                      </p>
                    )}
                  </div>
                )}



                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'aktif' | 'nonaktif')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Tidak Aktif</option>
                  </select>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditMode ? 'Perbarui' : 'Simpan'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Detail Modal */}
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Detail Pengguna</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white font-medium text-xl">
                        {selectedUser.nama.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedUser.nama}</h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedUser.status)}`}>
                      {selectedUser.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>

                {selectedUser.kelas && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Kelas</label>
                    <p className="text-gray-900">{selectedUser.kelas}</p>
                  </div>
                )}

                {/* tempat_pkl field removed from User model */}

                <div>
                  <label className="block text-sm font-medium text-gray-500">Tanggal Dibuat</label>
                  <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openEditModal(selectedUser);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
         )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
                <button
                  onClick={cancelDeleteUser}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Hapus Pengguna</h4>
                    <p className="text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {userToDelete.nama.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{userToDelete.nama}</p>
                      <p className="text-sm text-gray-500">{userToDelete.email}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userToDelete.role)}`}>
                        {userToDelete.role.charAt(0).toUpperCase() + userToDelete.role.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus pengguna <strong>{userToDelete.nama}</strong>? 
                  Semua data yang terkait dengan pengguna ini akan dihapus secara permanen.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDeleteUser}
                    disabled={isDeleting}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmDeleteUser}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import CSV Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Import Data Siswa dari CSV</h3>
                <button
                  onClick={closeImportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Petunjuk Import CSV:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• File harus berformat CSV (.csv)</li>
                    <li>• Header yang diperlukan: nama, email, password, role</li>
                    <li>• Header opsional: kelas (untuk siswa)</li>
                    <li>• Role harus berisi: admin, guru, atau siswa</li>
                    <li>• Unduh template CSV untuk format yang benar</li>
                  </ul>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih File CSV
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-sm font-medium text-gray-900">
                        Klik untuk pilih file CSV
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        atau drag & drop file di sini
                      </span>
                    </label>
                  </div>
                  
                  {csvFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">{csvFile.name}</span>
                        <button
                          onClick={() => setCsvFile(null)}
                          className="ml-auto text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {isImporting && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Mengimpor data...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Import Results */}
                {importResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{importResults.success}</div>
                          <div className="text-sm text-green-800">Berhasil</div>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                          <div className="text-sm text-red-800">Gagal</div>
                        </div>
                      </div>
                    </div>

                    {importResults.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-red-900 mb-2">Error Details:</h5>
                        <div className="max-h-32 overflow-y-auto">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="text-sm text-red-800 mb-1">
                              {error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeImportModal}
                    disabled={isImporting}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {importResults ? 'Tutup' : 'Batal'}
                  </button>
                  
                  {!importResults && (
                    <button
                      onClick={importCsvData}
                      disabled={!csvFile || isImporting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isImporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Mengimpor...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Data
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}