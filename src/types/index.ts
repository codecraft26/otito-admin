export interface NewsItem {
  id: string;
  title: string;
  twoLineSummary: string;
  fourLineSummary: string;
  swipeSummary: string;
  fullDescription: string;
  originalDescription: string;
  category: string;
  tags: string[];
  isHeadline: boolean;
  isPublished: boolean;
  language: 'hindi' | 'english';
  createdAt: string;
  updatedAt: string;
  lockedBy?: string; // Admin ID who has locked this item
  lockedAt?: string;
  publishedAt?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface SystemConfig {
  id: string;
  hindiPrompt: string;
  englishPrompt: string;
  newsFrequency: number; // in minutes
  autoPublish: boolean;
  maxNewsPerBatch: number;
  categories: string[];
}

export interface SystemStats {
  totalAdmins: number;
  totalNews: number;
  publishedNews: number;
  unpublishedNews: number;
  totalHeadlines: number;
  newsPublishedToday: number;
  newsPublishedThisWeek: number;
  newsPublishedThisMonth: number;
}

export interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface NewsLockInfo {
  newsId: string;
  lockedBy: string;
  lockedAt: string;
  adminName: string;
} 