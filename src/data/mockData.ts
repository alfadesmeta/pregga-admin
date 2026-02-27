/**
 * Mock Data for Development
 * Replace with Supabase queries in production
 */

import type {
  User,
  Doula,
  ChatSession,
  Transaction,
  DashboardStats,
  ChartDataPoint,
  RecentActivity,
} from "../types";

export const usersData: User[] = [
  { id: "USR-001", name: "Emma Thompson", email: "emma.t@email.com", phone: "(555) 111-2222", status: "active", pregnancyWeek: 24, dueDate: "Jun 15, 2026", assignedDoula: "Sarah Mitchell", assignedDoulaId: "DLA-001", joinedAt: "Jan 15, 2026", lastActive: "2 hours ago" },
  { id: "USR-002", name: "Olivia Martinez", email: "olivia.m@email.com", phone: "(555) 333-4444", status: "active", pregnancyWeek: 32, dueDate: "Apr 20, 2026", assignedDoula: "Jennifer Lee", assignedDoulaId: "DLA-002", joinedAt: "Dec 10, 2025", lastActive: "1 day ago" },
  { id: "USR-003", name: "Sophia Johnson", email: "sophia.j@email.com", phone: "(555) 555-6666", status: "pending", pregnancyWeek: 12, dueDate: "Aug 05, 2026", joinedAt: "Feb 20, 2026", lastActive: "5 hours ago" },
  { id: "USR-004", name: "Isabella Brown", email: "isabella.b@email.com", phone: "(555) 777-8888", status: "active", pregnancyWeek: 28, dueDate: "May 10, 2026", assignedDoula: "Amanda Chen", assignedDoulaId: "DLA-003", joinedAt: "Nov 05, 2025", lastActive: "3 hours ago" },
  { id: "USR-005", name: "Mia Davis", email: "mia.d@email.com", phone: "(555) 999-0000", status: "active", pregnancyWeek: 36, dueDate: "Mar 25, 2026", assignedDoula: "Sarah Mitchell", assignedDoulaId: "DLA-001", joinedAt: "Oct 15, 2025", lastActive: "30 minutes ago" },
  { id: "USR-006", name: "Charlotte Wilson", email: "charlotte.w@email.com", phone: "(555) 234-5678", status: "inactive", pregnancyWeek: 40, dueDate: "Feb 28, 2026", joinedAt: "Sep 20, 2025", lastActive: "1 week ago" },
  { id: "USR-007", name: "Amelia Garcia", email: "amelia.g@email.com", phone: "(555) 345-6789", status: "active", pregnancyWeek: 20, dueDate: "Jul 12, 2026", assignedDoula: "Jennifer Lee", assignedDoulaId: "DLA-002", joinedAt: "Jan 28, 2026", lastActive: "4 hours ago" },
  { id: "USR-008", name: "Harper Anderson", email: "harper.a@email.com", phone: "(555) 456-7890", status: "active", pregnancyWeek: 16, dueDate: "Aug 18, 2026", assignedDoula: "Rachel Kim", assignedDoulaId: "DLA-004", joinedAt: "Feb 05, 2026", lastActive: "1 hour ago" },
  { id: "USR-009", name: "Evelyn Taylor", email: "evelyn.t@email.com", phone: "(555) 567-8901", status: "pending", pregnancyWeek: 8, dueDate: "Sep 30, 2026", joinedAt: "Feb 25, 2026", lastActive: "2 days ago" },
  { id: "USR-010", name: "Abigail Moore", email: "abigail.m@email.com", phone: "(555) 678-9012", status: "active", pregnancyWeek: 30, dueDate: "Apr 28, 2026", assignedDoula: "Amanda Chen", assignedDoulaId: "DLA-003", joinedAt: "Dec 01, 2025", lastActive: "6 hours ago" },
];

export const doulasData: Doula[] = [
  { id: "DLA-001", name: "Sarah Mitchell", email: "sarah.m@pregga.com", phone: "(555) 100-2000", status: "verified", specializations: ["Labor Support", "Postpartum Care", "Breastfeeding"], rating: 4.9, totalClients: 45, activeClients: 8, completedSessions: 312, joinedAt: "Mar 15, 2024", lastActive: "1 hour ago", bio: "Certified doula with 8 years of experience supporting mothers through pregnancy and birth." },
  { id: "DLA-002", name: "Jennifer Lee", email: "jennifer.l@pregga.com", phone: "(555) 100-3000", status: "verified", specializations: ["High-Risk Pregnancy", "VBAC Support", "Twins"], rating: 4.8, totalClients: 38, activeClients: 6, completedSessions: 256, joinedAt: "Jun 20, 2024", lastActive: "3 hours ago", bio: "Specializing in high-risk pregnancies with a gentle, supportive approach." },
  { id: "DLA-003", name: "Amanda Chen", email: "amanda.c@pregga.com", phone: "(555) 100-4000", status: "verified", specializations: ["Natural Birth", "Hypnobirthing", "Water Birth"], rating: 4.95, totalClients: 52, activeClients: 10, completedSessions: 389, joinedAt: "Jan 10, 2024", lastActive: "30 minutes ago", bio: "Passionate about natural birthing methods and empowering mothers." },
  { id: "DLA-004", name: "Rachel Kim", email: "rachel.k@pregga.com", phone: "(555) 100-5000", status: "verified", specializations: ["First-Time Mothers", "Prenatal Yoga", "Nutrition"], rating: 4.7, totalClients: 29, activeClients: 5, completedSessions: 178, joinedAt: "Sep 05, 2024", lastActive: "2 hours ago", bio: "Dedicated to supporting first-time mothers with holistic care." },
  { id: "DLA-005", name: "Michelle Torres", email: "michelle.t@pregga.com", phone: "(555) 100-6000", status: "pending", specializations: ["Postpartum Depression", "Mental Health", "Sleep Training"], rating: 4.6, totalClients: 15, activeClients: 3, completedSessions: 89, joinedAt: "Dec 15, 2024", lastActive: "5 hours ago", bio: "Focus on maternal mental health and postpartum support." },
  { id: "DLA-006", name: "Lisa Wang", email: "lisa.w@pregga.com", phone: "(555) 100-7000", status: "inactive", specializations: ["C-Section Recovery", "Infant Care"], rating: 4.5, totalClients: 22, activeClients: 0, completedSessions: 145, joinedAt: "Apr 20, 2024", lastActive: "2 weeks ago", bio: "Experienced in C-section recovery and newborn care." },
];

export const chatSessionsData: ChatSession[] = [
  { id: "CHT-001", userId: "USR-001", userName: "Emma Thompson", doulaId: "DLA-001", doulaName: "Sarah Mitchell", status: "active", lastMessage: "Thank you for the breathing exercises!", lastMessageAt: "10 minutes ago", messageCount: 45, startedAt: "Jan 20, 2026", avgResponseTime: "5 min" },
  { id: "CHT-002", userId: "USR-002", userName: "Olivia Martinez", doulaId: "DLA-002", doulaName: "Jennifer Lee", status: "active", lastMessage: "I have a question about contractions", lastMessageAt: "2 hours ago", messageCount: 78, startedAt: "Dec 15, 2025", avgResponseTime: "8 min" },
  { id: "CHT-003", userId: "USR-004", userName: "Isabella Brown", doulaId: "DLA-003", doulaName: "Amanda Chen", status: "active", lastMessage: "The hypnobirthing session was amazing!", lastMessageAt: "1 hour ago", messageCount: 62, startedAt: "Nov 10, 2025", avgResponseTime: "4 min" },
  { id: "CHT-004", userId: "USR-005", userName: "Mia Davis", doulaId: "DLA-001", doulaName: "Sarah Mitchell", status: "flagged", lastMessage: "I'm feeling anxious about the delivery", lastMessageAt: "30 minutes ago", messageCount: 89, startedAt: "Oct 20, 2025", avgResponseTime: "3 min" },
  { id: "CHT-005", userId: "USR-007", userName: "Amelia Garcia", doulaId: "DLA-002", doulaName: "Jennifer Lee", status: "active", lastMessage: "See you at the next appointment!", lastMessageAt: "4 hours ago", messageCount: 34, startedAt: "Feb 01, 2026", avgResponseTime: "6 min" },
  { id: "CHT-006", userId: "USR-008", userName: "Harper Anderson", doulaId: "DLA-004", doulaName: "Rachel Kim", status: "active", lastMessage: "The yoga routine is helping so much", lastMessageAt: "3 hours ago", messageCount: 28, startedAt: "Feb 10, 2026", avgResponseTime: "7 min" },
  { id: "CHT-007", userId: "USR-010", userName: "Abigail Moore", doulaId: "DLA-003", doulaName: "Amanda Chen", status: "archived", lastMessage: "Thank you for everything!", lastMessageAt: "1 week ago", messageCount: 156, startedAt: "Dec 05, 2025", avgResponseTime: "5 min" },
];

export const transactionsData: Transaction[] = [
  { id: "TXN-001", userId: "USR-001", userName: "Emma Thompson", type: "subscription", amount: 49.99, status: "completed", date: "Feb 27, 2026", description: "Monthly Premium Subscription" },
  { id: "TXN-002", userId: "USR-002", userName: "Olivia Martinez", type: "session", amount: 75.00, status: "completed", date: "Feb 26, 2026", description: "1-on-1 Doula Session" },
  { id: "TXN-003", userId: "USR-004", userName: "Isabella Brown", type: "subscription", amount: 49.99, status: "completed", date: "Feb 25, 2026", description: "Monthly Premium Subscription" },
  { id: "TXN-004", userId: "USR-005", userName: "Mia Davis", type: "session", amount: 150.00, status: "completed", date: "Feb 24, 2026", description: "Birth Preparation Package" },
  { id: "TXN-005", userId: "USR-007", userName: "Amelia Garcia", type: "subscription", amount: 49.99, status: "pending", date: "Feb 23, 2026", description: "Monthly Premium Subscription" },
  { id: "TXN-006", userId: "USR-003", userName: "Sophia Johnson", type: "refund", amount: -49.99, status: "completed", date: "Feb 22, 2026", description: "Subscription Refund" },
  { id: "TXN-007", userId: "USR-008", userName: "Harper Anderson", type: "session", amount: 75.00, status: "completed", date: "Feb 21, 2026", description: "1-on-1 Doula Session" },
  { id: "TXN-008", userId: "USR-010", userName: "Abigail Moore", type: "subscription", amount: 49.99, status: "failed", date: "Feb 20, 2026", description: "Monthly Premium Subscription" },
];

export const dashboardStats: DashboardStats = {
  totalUsers: 1247,
  usersThisMonth: 89,
  activeDoulas: 24,
  totalChats: 3891,
  avgResponseTime: "4.5 min",
  monthlyRevenue: 45680,
  userSatisfaction: 94,
  pendingVerifications: 5,
};

export const userGrowthData: ChartDataPoint[] = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 62 },
  { day: "Wed", value: 78 },
  { day: "Thu", value: 95 },
  { day: "Fri", value: 82 },
  { day: "Sat", value: 110 },
  { day: "Sun", value: 89 },
];

export const revenueData: ChartDataPoint[] = [
  { day: "Week 1", value: 8500 },
  { day: "Week 2", value: 12300 },
  { day: "Week 3", value: 10800 },
  { day: "Week 4", value: 14080 },
];

export const recentActivities: RecentActivity[] = [
  { id: "1", type: "new_user", title: "New user registered", description: "Emma Thompson joined Pregga", time: "2 hours ago" },
  { id: "2", type: "verification", title: "Doula verification pending", description: "Michelle Torres awaiting review", time: "4 hours ago", status: "pending" },
  { id: "3", type: "payment", title: "Payment received", description: "$150.00 from Mia Davis", time: "5 hours ago", status: "completed" },
  { id: "4", type: "chat_started", title: "New chat session", description: "Harper Anderson started chat with Rachel Kim", time: "6 hours ago" },
  { id: "5", type: "new_doula", title: "New doula application", description: "Lisa Wang applied to join", time: "1 day ago" },
];

export const pendingVerifications = [
  { id: "DLA-005", name: "Michelle Torres", email: "michelle.t@pregga.com", appliedAt: "Feb 20, 2026", documents: 3 },
  { id: "DLA-007", name: "Nicole Adams", email: "nicole.a@pregga.com", appliedAt: "Feb 22, 2026", documents: 2 },
  { id: "DLA-008", name: "Karen White", email: "karen.w@pregga.com", appliedAt: "Feb 25, 2026", documents: 4 },
];

export const topDoulas = [
  { id: "DLA-003", name: "Amanda Chen", rating: 4.95, clients: 10, color: "#8B7355" },
  { id: "DLA-001", name: "Sarah Mitchell", rating: 4.9, clients: 8, color: "#6B8E6B" },
  { id: "DLA-002", name: "Jennifer Lee", rating: 4.8, clients: 6, color: "#C97B8E" },
  { id: "DLA-004", name: "Rachel Kim", rating: 4.7, clients: 5, color: "#C4896B" },
];
