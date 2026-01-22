export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date | null;
}

export interface UserFilters {
  role?: string;
  active?: boolean;
  search?: string;
  page: number;
  limit: number;
}
