export interface NewsItem {
  _id?: string; // MongoDB ID from API
  id?: string; // Legacy ID for compatibility
  articleId?: string; // API article ID
  title: string;
  twoLineSummary?: string; // Legacy field
  twoLineDescription?: string; // API field
  fourLineSummary?: string; // Legacy field
  fourLineDescription?: string; // API field
  swipeSummary?: string; // Legacy field
  swipeDescription?: string; // API field
  fullDescription?: string; // Legacy field
  content?: string; // API field
  category: string | string[]; // API returns array
  tags: string[];
  isHeadline: boolean;
  isPublished: boolean;
  language: 'hindi' | 'english' | 'HI' | 'EN'; // API uses HI/EN
  createdAt: string;
  updatedAt: string;
  lockedBy?: string; // Admin ID who has locked this item
  lockedAt?: string;
  publishedAt?: string;
  pubDate?: string; // API field
  imageUrl?: string;
  image_url?: string; // API field
  sourceUrl?: string;
  source?: string; // API field
  headlineOrder?: number; // API field
}

export interface ArticlesResponse {
  articles: NewsItem[];
  totalArticles: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
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

// API Response types
export interface ApiAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
}

export interface LoginResponse {
  success: boolean;
  token: string;
  admin: ApiAdminUser;
  message?: string;
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

// New Configuration API types based on API documentation
export interface ConfigurationData {
  _id: string;
  ai: {
    api_key: string;
    end_point: string;
    org_id?: string;
  };
  news: {
    key: string;
    end_point: string;
    params: string;
  };
  country: string;
  englishPrompt?: string;
  hindiPrompt?: string;
  language: 'en' | 'hi';
  publish_state: boolean;
  cron_interval: string;
  auto_publish_mode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationResponse {
  success: boolean;
  data: ConfigurationData;
  message?: string;
}

export interface UpdateConfigurationRequest {
  ai?: {
    api_key?: string;
    end_point?: string;
    org_id?: string;
  };
  news?: {
    key?: string;
    end_point?: string;
    params?: string;
  };
  country?: string;
  englishPrompt?: string;
  hindiPrompt?: string;
  language?: 'en' | 'hi';
  publish_state?: boolean;
  cron_interval?: string;
  auto_publish_mode?: boolean;
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

// New Dashboard Statistics API interfaces
export interface DashboardOverview {
  totalNews: { count: number; percentageChange: number };
  published: { count: number; percentageChange: number };
  unpublished: { count: number; percentageChange: number };
  headlines: { count: number; percentageChange: number };
  totalAdmins: { count: number; percentageChange: number };
  todayNews: { count: number; percentageChange: number };
}

export interface WeeklyActivity {
  day: string;
  published: number;
  unpublished: number;
}

export interface MonthlyTrend {
  month: string;
  totalNews: number;
  headlines: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
}

export interface PerformanceMetrics {
  publicationRate: number;
  avgProcessingTime: number;
  totalReaders: number;
  avgRating: number;
}

export interface ActivitySummary {
  thisWeekPublished: number;
  thisMonthPublished: number;
  activeHeadlines: number;
  systemAdmins: number;
}

export interface SystemHealth {
  apiStatus: string;
  uptime: string;
  performance: string;
}

export interface DashboardStatsData {
  overview: DashboardOverview;
  weeklyActivity: WeeklyActivity[];
  monthlyTrends: MonthlyTrend[];
  categoryDistribution: CategoryDistribution[];
  languageDistribution: LanguageDistribution[];
  performanceMetrics: PerformanceMetrics;
  activitySummary: ActivitySummary;
  systemHealth: SystemHealth;
  autoPublishMode?: boolean;
}

export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStatsData;
}

export interface AutoPublishStatusResponse {
  success: boolean;
  autoPublishMode: boolean;
  message: string;
}

export interface AutoPublishToggleResponse {
  success: boolean;
  autoPublishMode: boolean;
  message: string;
}

export interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
  handleTokenExpiration: () => void;
}

export interface NewsLockInfo {
  newsId: string;
  lockedBy: string;
  lockedAt: string;
  adminName: string;
} 