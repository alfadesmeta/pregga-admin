/**
 * Pregga Admin - Type Definitions
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  pregnancyWeek?: number;
  dueDate?: string;
  assignedDoula?: string;
  assignedDoulaId?: string;
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
}

export interface Doula {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending" | "verified" | "unverified";
  specializations: string[];
  rating: number;
  totalClients: number;
  activeClients: number;
  completedSessions: number;
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
  bio?: string;
  certifications?: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  doulaId: string;
  doulaName: string;
  status: "active" | "archived" | "flagged";
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  startedAt: string;
  avgResponseTime?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "doula";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "subscription" | "session" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  description: string;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalDoulas: number;
  activeDoulas: number;
  totalChats: number;
  avgResponseTime: string;
  totalRevenue: number;
  revenueThisMonth: number;
  userGrowthRate: number;
}

export interface DashboardStats {
  totalUsers: number;
  usersThisMonth: number;
  activeDoulas: number;
  totalChats: number;
  avgResponseTime: string;
  monthlyRevenue: number;
  userSatisfaction: number;
  pendingVerifications: number;
}

export interface ChartDataPoint {
  day: string;
  value: number;
  label?: string;
}

export interface RecentActivity {
  id: string;
  type: "new_user" | "new_doula" | "chat_started" | "payment" | "verification";
  title: string;
  description: string;
  time: string;
  status?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
}
