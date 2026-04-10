import { supabase } from './supabase';
import type {
  Profile,
  PregnantProfile,
  DoulaProfile,
  BroadcastRequest,
  Subscription,
  WeeklyContent,
  AppConfig,
  DeletionRequest,
  UserWithProfile,
  DoulaWithProfile,
  ConversationWithUsers,
  BroadcastWithDetails,
  BroadcastStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  DoulaAssignmentWithUser,
} from '../types/database';

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalDoulas: number;
  activeDoulas: number;
  pendingVerifications: number;
  totalConversations: number;
  activeConversations: number;
  pendingBroadcasts: number;
  expiredBroadcasts: number;
  activeSubscriptions: number;
}

export interface UserFilters {
  search?: string;
  hasSubscription?: boolean;
  hasDoula?: boolean;
}

export interface DoulaFilters {
  search?: string;
  isAvailable?: boolean;
  isOnline?: boolean;
}

export interface ConversationFilters {
  search?: string;
  isActive?: boolean;
}

export interface BroadcastFilters {
  search?: string;
  status?: BroadcastStatus;
}

export interface SubscriptionFilters {
  search?: string;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
}

// ============================================
// DASHBOARD APIs
// ============================================

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [
    usersResult,
    doulasResult,
    activeDoulasResult,
    pendingVerificationsResult,
    conversationsResult,
    activeConversationsResult,
    pendingBroadcastsResult,
    expiredBroadcastsResult,
    activeSubscriptionsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'pregnant'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'doula'),
    supabase.from('doula_profiles').select('id', { count: 'exact', head: true }).eq('is_available', true),
    supabase.from('doula_profiles').select('id', { count: 'exact', head: true }).eq('is_available', false),
    supabase.from('conversations').select('id', { count: 'exact', head: true }),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('broadcast_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('broadcast_requests').select('id', { count: 'exact', head: true }).eq('status', 'expired'),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  return {
    totalUsers: usersResult.count || 0,
    totalDoulas: doulasResult.count || 0,
    activeDoulas: activeDoulasResult.count || 0,
    pendingVerifications: pendingVerificationsResult.count || 0,
    totalConversations: conversationsResult.count || 0,
    activeConversations: activeConversationsResult.count || 0,
    pendingBroadcasts: pendingBroadcastsResult.count || 0,
    expiredBroadcasts: expiredBroadcastsResult.count || 0,
    activeSubscriptions: activeSubscriptionsResult.count || 0,
  };
}

export async function fetchRecentUsers(limit: number = 5): Promise<UserWithProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      pregnant_profiles (*),
      subscriptions (*)
    `)
    .eq('user_role', 'pregnant')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as UserWithProfile[];
}

export async function fetchPendingVerifications(): Promise<DoulaWithProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      doula_profiles (*)
    `)
    .eq('user_role', 'doula')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data || []).filter(d => d.doula_profiles && !d.doula_profiles.is_available) as DoulaWithProfile[];
}

export async function fetchWeeklyRegistrations(): Promise<{ week: string; count: number }[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('user_role', 'pregnant')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;

  const weekCounts: Record<string, number> = {};
  data?.forEach((profile) => {
    const date = new Date(profile.created_at);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
  });

  return Object.entries(weekCounts)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export async function fetchDailyRegistrations(days: number = 30): Promise<{ date: string; count: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('user_role', 'pregnant')
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  const dayCounts: Record<string, number> = {};
  
  for (let i = 0; i <= days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayCounts[d.toISOString().split('T')[0]] = 0;
  }

  data?.forEach((profile) => {
    const dateKey = new Date(profile.created_at).toISOString().split('T')[0];
    if (dayCounts[dateKey] !== undefined) {
      dayCounts[dateKey]++;
    }
  });

  return Object.entries(dayCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================
// USER APIs
// ============================================

export async function fetchUsers(
  from: number,
  to: number,
  filters?: UserFilters
): Promise<PaginatedResponse<UserWithProfile>> {
  let query = supabase
    .from('profiles')
    .select(`
      *,
      pregnant_profiles (*),
      subscriptions (*)
    `, { count: 'exact' })
    .eq('user_role', 'pregnant');

  if (filters?.search) {
    query = query.or(`display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  
  let result = data as UserWithProfile[];
  
  // Filter by subscription status (client-side since it's a relation)
  if (filters?.hasSubscription === true) {
    result = result.filter(u => u.subscriptions && u.subscriptions.length > 0 && u.subscriptions.some(s => s.status === 'active'));
  } else if (filters?.hasSubscription === false) {
    result = result.filter(u => !u.subscriptions || u.subscriptions.length === 0 || !u.subscriptions.some(s => s.status === 'active'));
  }
  
  // Note: count reflects server-side count, filtered count may differ
  return { data: result, count: filters?.hasSubscription !== undefined ? result.length : (count || 0) };
}

export async function fetchUserById(id: string): Promise<UserWithProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      pregnant_profiles (*),
      subscriptions (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as UserWithProfile;
}

export async function updateUserProfile(
  id: string,
  profileData: Partial<Profile>,
  pregnantData?: Partial<PregnantProfile>
): Promise<void> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', id);

  if (profileError) throw profileError;

  if (pregnantData) {
    const { error: pregnantError } = await supabase
      .from('pregnant_profiles')
      .update(pregnantData)
      .eq('user_id', id);

    if (pregnantError) throw pregnantError;
  }
}

export async function deleteUser(id: string): Promise<void> {
  // Permanently delete user via edge function
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { user_id: id }
  });

  if (error) throw error;
}

export async function fetchDeletionRequests(): Promise<(DeletionRequest & { user?: UserWithProfile })[]> {
  // Fetch user-initiated deletion requests (pending status)
  const { data, error } = await supabase
    .from('deletion_requests')
    .select(`
      *,
      user:profiles!deletion_requests_user_id_fkey (
        *,
        pregnant_profiles (*),
        subscriptions (*)
      )
    `)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return data as (DeletionRequest & { user?: UserWithProfile })[];
}

export async function approveDeletionRequest(requestId: string, userId: string): Promise<void> {
  // Approve and permanently delete the user
  const { error } = await supabase.functions.invoke('delete-user', {
    body: { user_id: userId, request_id: requestId }
  });

  if (error) throw error;
}

export async function rejectDeletionRequest(requestId: string): Promise<void> {
  // Reject user's deletion request - remove the request
  const { error } = await supabase
    .from('deletion_requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

export async function fetchUserConversations(userId: string): Promise<ConversationWithUsers[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      pregnant_user:profiles!conversations_pregnant_user_id_fkey (*),
      doula:profiles!conversations_doula_id_fkey (*)
    `)
    .eq('pregnant_user_id', userId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data as ConversationWithUsers[];
}

export async function fetchUserBroadcasts(userId: string): Promise<BroadcastRequest[]> {
  const { data, error } = await supabase
    .from('broadcast_requests')
    .select('*')
    .eq('pregnant_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================
// DOULA APIs
// ============================================

export async function fetchDoulas(
  from: number,
  to: number,
  filters?: DoulaFilters
): Promise<PaginatedResponse<DoulaWithProfile>> {
  const needsInnerJoin =
    filters?.isAvailable !== undefined ||
    filters?.isOnline !== undefined;

  let query = supabase
    .from('profiles')
    .select(
      needsInnerJoin ? `*, doula_profiles!inner(*)` : `*, doula_profiles (*)`,
      { count: 'exact' }
    )
    .eq('user_role', 'doula');

  if (filters?.search) {
    query = query.or(
      `display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
    );
  }

  if (filters?.isAvailable !== undefined) {
    query = query.eq('doula_profiles.is_available', filters.isAvailable);
  }

  if (filters?.isOnline !== undefined) {
    query = query.eq('doula_profiles.is_online', filters.isOnline);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return { data: (data as DoulaWithProfile[]) || [], count: count ?? 0 };
}

export async function fetchDoulaKpiCounts(): Promise<{
  total: number;
  available: number;
}> {
  const [totalRes, availableRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('user_role', 'doula'),
    supabase.from('doula_profiles').select('id', { count: 'exact', head: true }).eq('is_available', true),
  ]);

  return {
    total: totalRes.count ?? 0,
    available: availableRes.count ?? 0,
  };
}

export async function fetchDoulaById(id: string): Promise<DoulaWithProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      doula_profiles (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as DoulaWithProfile;
}

export async function updateDoulaProfile(
  id: string,
  profileData: Partial<Profile>,
  doulaData?: Partial<DoulaProfile>
): Promise<void> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', id);

  if (profileError) throw profileError;

  if (doulaData) {
    const { error: doulaError } = await supabase
      .from('doula_profiles')
      .update(doulaData)
      .eq('user_id', id);

    if (doulaError) throw doulaError;
  }
}

export async function updateDoulaAvailability(id: string, isAvailable: boolean): Promise<void> {
  const { error } = await supabase
    .from('doula_profiles')
    .update({ is_available: isAvailable })
    .eq('user_id', id);

  if (error) throw error;
}

export async function deactivateDoula(id: string): Promise<void> {
  const { error } = await supabase
    .from('doula_profiles')
    .update({ is_available: false })
    .eq('user_id', id);

  if (error) throw error;
}

export async function reactivateDoula(id: string): Promise<void> {
  const { error } = await supabase
    .from('doula_profiles')
    .update({ is_available: true })
    .eq('user_id', id);

  if (error) throw error;
}

export async function fetchInactiveDoulas(): Promise<DoulaWithProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      doula_profiles!inner (*)
    `)
    .eq('user_role', 'doula')
    .eq('doula_profiles.is_available', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DoulaWithProfile[];
}

export async function fetchDoulaClients(doulaId: string): Promise<UserWithProfile[]> {
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('pregnant_user_id')
    .eq('doula_id', doulaId);

  if (convError) throw convError;

  const userIds = [...new Set(conversations?.map(c => c.pregnant_user_id) || [])];
  
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      pregnant_profiles (*),
      subscriptions (*)
    `)
    .in('id', userIds);

  if (error) throw error;
  return data as UserWithProfile[];
}

export async function fetchDoulaConversations(doulaId: string): Promise<ConversationWithUsers[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      pregnant_user:profiles!conversations_pregnant_user_id_fkey (*),
      doula:profiles!conversations_doula_id_fkey (*)
    `)
    .eq('doula_id', doulaId)
    .order('started_at', { ascending: false });

  if (error) throw error;
  return data as ConversationWithUsers[];
}

// ============================================
// DOULA ASSIGNMENT APIs
// ============================================

export async function createDoula(data: {
  email: string;
  displayName: string;
  phone?: string;
  bio?: string;
  yearsExperience?: string;
  expertise?: string[];
}): Promise<string> {
  const { data: result, error } = await supabase.functions.invoke("create-doula", {
    body: {
      email: data.email,
      displayName: data.displayName,
      phone: data.phone,
      bio: data.bio,
      yearsExperience: data.yearsExperience,
      expertise: data.expertise || [],
    },
  });

  if (error) throw new Error("Network error. Please try again.");
  if (!result?.success) throw new Error(result?.message || "Failed to create doula");

  return result.userId;
}

export async function fetchDoulaAssignments(doulaId: string): Promise<DoulaAssignmentWithUser[]> {
  const { data, error } = await supabase
    .from('doula_assignments')
    .select(`
      *,
      user:profiles!doula_assignments_user_id_fkey (
        *,
        pregnant_profiles (*)
      )
    `)
    .eq('doula_id', doulaId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return (data || []) as DoulaAssignmentWithUser[];
}

export async function assignClientToDoula(doulaId: string, userId: string): Promise<void> {
  const { data: { user: caller } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('doula_assignments')
    .insert({
      doula_id: doulaId,
      user_id: userId,
      assigned_by: caller?.id || null,
    });

  if (error) {
    if (error.code === '23505') throw new Error('Client is already assigned to this doula');
    throw error;
  }
}

export async function unassignClientFromDoula(doulaId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('doula_assignments')
    .delete()
    .eq('doula_id', doulaId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchUnassignedUsers(doulaId: string, search?: string): Promise<UserWithProfile[]> {
  const { data: assigned } = await supabase
    .from('doula_assignments')
    .select('user_id')
    .eq('doula_id', doulaId);

  const assignedIds = (assigned || []).map(a => a.user_id);

  let query = supabase
    .from('profiles')
    .select(`*, pregnant_profiles (*), subscriptions (*)`)
    .eq('user_role', 'pregnant')
    .order('display_name', { ascending: true })
    .limit(20);

  if (assignedIds.length > 0) {
    query = query.not('id', 'in', `(${assignedIds.join(',')})`);
  }

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as UserWithProfile[];
}

// ============================================
// CONVERSATION APIs
// ============================================

export async function fetchConversations(
  from: number,
  to: number,
  filters?: ConversationFilters
): Promise<PaginatedResponse<ConversationWithUsers>> {
  let query = supabase
    .from('conversations')
    .select(`
      *,
      pregnant_user:profiles!conversations_pregnant_user_id_fkey (*),
      doula:profiles!conversations_doula_id_fkey (*)
    `, { count: 'exact' });

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error, count } = await query
    .order('started_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  let result = data as ConversationWithUsers[];
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(c => 
      c.pregnant_user?.display_name?.toLowerCase().includes(searchLower) ||
      c.doula?.display_name?.toLowerCase().includes(searchLower)
    );
  }

  return { data: result, count: count || 0 };
}

export async function fetchConversationTabCounts(): Promise<{ active: number; archived: number }> {
  const [active, archived] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .or('is_active.eq.false,is_active.is.null'),
  ]);

  return {
    active: active.count ?? 0,
    archived: archived.count ?? 0,
  };
}

export async function fetchConversationById(id: string): Promise<ConversationWithUsers | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      pregnant_user:profiles!conversations_pregnant_user_id_fkey (*),
      doula:profiles!conversations_doula_id_fkey (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ConversationWithUsers;
}

export async function endConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function reactivateConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ is_active: true, ended_at: null })
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BROADCAST APIs
// ============================================

export async function fetchBroadcastStatusCounts(): Promise<{
  pending: number;
  accepted: number;
  expired: number;
}> {
  const [pending, accepted, expired] = await Promise.all([
    supabase.from('broadcast_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('broadcast_requests').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('broadcast_requests').select('id', { count: 'exact', head: true }).eq('status', 'expired'),
  ]);

  return {
    pending: pending.count ?? 0,
    accepted: accepted.count ?? 0,
    expired: expired.count ?? 0,
  };
}

export async function fetchBroadcasts(
  from: number,
  to: number,
  filters?: BroadcastFilters
): Promise<PaginatedResponse<BroadcastWithDetails>> {
  let query = supabase
    .from('broadcast_requests')
    .select(`
      *,
      user:profiles!broadcast_requests_pregnant_user_id_fkey (*),
      accepted_doula:profiles!broadcast_requests_accepted_by_doula_id_fkey (*)
    `, { count: 'exact' });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const broadcastsWithRejections = await Promise.all(
    (data || []).map(async (broadcast) => {
      const { data: rejections } = await supabase
        .from('broadcast_rejections')
        .select(`
          *,
          doula:profiles!broadcast_rejections_doula_id_fkey (*)
        `)
        .eq('request_id', broadcast.id);

      return {
        ...broadcast,
        rejections: rejections || [],
      } as BroadcastWithDetails;
    })
  );

  let result = broadcastsWithRejections;
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(b => 
      b.user?.display_name?.toLowerCase().includes(searchLower) ||
      b.initial_message?.toLowerCase().includes(searchLower)
    );
  }

  return { data: result, count: count || 0 };
}

export async function fetchBroadcastById(id: string): Promise<BroadcastWithDetails | null> {
  const { data, error } = await supabase
    .from('broadcast_requests')
    .select(`
      *,
      user:profiles!broadcast_requests_pregnant_user_id_fkey (*),
      accepted_doula:profiles!broadcast_requests_accepted_by_doula_id_fkey (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: rejections } = await supabase
    .from('broadcast_rejections')
    .select(`
      *,
      doula:profiles!broadcast_rejections_doula_id_fkey (*)
    `)
    .eq('request_id', id);

  return {
    ...data,
    rejections: rejections || [],
  } as BroadcastWithDetails;
}

export async function cancelBroadcast(id: string): Promise<void> {
  const { error } = await supabase
    .from('broadcast_requests')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw error;
}

export async function renotifyDoulas(broadcastId: string): Promise<void> {
  const response = await supabase.functions.invoke('notify-doulas', {
    body: { broadcast_id: broadcastId },
  });

  if (response.error) throw response.error;
}

// ============================================
// SUBSCRIPTION APIs
// ============================================

export async function fetchSubscriptions(
  from: number,
  to: number,
  filters?: SubscriptionFilters
): Promise<PaginatedResponse<Subscription & { user: Profile }>> {
  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      user:profiles!user_id (*)
    `, { count: 'exact' });

  if (filters?.plan) {
    query = query.eq('plan_type', filters.plan);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  let result = data as (Subscription & { user: Profile })[];
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(s => 
      s.user?.display_name?.toLowerCase().includes(searchLower) ||
      s.user?.email?.toLowerCase().includes(searchLower)
    );
  }

  return { data: result, count: count || 0 };
}

export async function fetchSubscriptionById(id: string): Promise<(Subscription & { user: Profile }) | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      user:profiles!user_id (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Subscription & { user: Profile };
}

export async function updateSubscription(
  id: string,
  data: Partial<Subscription>
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function extendSubscription(id: string, newEndDate: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ expiration_at: newEndDate, status: 'active' })
    .eq('id', id);

  if (error) throw error;
}

export async function cancelSubscription(id: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// WEEKLY CONTENT APIs
// ============================================

export async function fetchWeeklyContent(): Promise<WeeklyContent[]> {
  const { data, error } = await supabase
    .from('weekly_content')
    .select('*')
    .order('week_number', { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchWeeklyContentById(id: string): Promise<WeeklyContent | null> {
  const { data, error } = await supabase
    .from('weekly_content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertWeeklyContent(content: Partial<WeeklyContent> & { week_number: number }): Promise<void> {
  const { error } = await supabase
    .from('weekly_content')
    .upsert(content, { onConflict: 'week_number' });

  if (error) throw error;
}

export async function deleteWeeklyContent(id: string): Promise<void> {
  const { error } = await supabase
    .from('weekly_content')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadWeeklyContentImage(weekNumber: number, file: File): Promise<string> {
  const bucket =
    (import.meta.env.VITE_WEEKLY_CONTENT_STORAGE_BUCKET as string | undefined)?.trim() || 'weekly-content';
  const fileExt = file.name.split('.').pop();
  const filePath = `week-${weekNumber}/illustration.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });

  if (uploadError) {
    const msg = uploadError.message || '';
    if (msg.includes('Bucket not found') || msg.includes('not found')) {
      throw new Error(
        `Storage bucket "${bucket}" does not exist. Create it in Supabase Dashboard → Storage (public read recommended for illustrations), or set VITE_WEEKLY_CONTENT_STORAGE_BUCKET to your bucket name.`
      );
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

// ============================================
// APP CONFIG APIs
// ============================================

export async function fetchAppConfig(): Promise<AppConfig[]> {
  const { data, error } = await supabase
    .from('app_config')
    .select('*')
    .order('key', { ascending: true });

  if (error) throw error;
  return data;
}

export async function updateAppConfig(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('app_config')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) throw error;
}

export async function deleteAppConfig(key: string): Promise<void> {
  const { error } = await supabase
    .from('app_config')
    .delete()
    .eq('key', key);

  if (error) throw error;
}

// ============================================
// ADMIN PROFILE APIs
// ============================================

export async function fetchAdminProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAdminProfile(userId: string, data: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  
  await updateAdminProfile(userId, { avatar_url: data.publicUrl });
  
  return data.publicUrl;
}
