import { supabase } from './supabase';
import type {
  Profile,
  PregnantProfile,
  DoulaProfile,
  BroadcastRequest,
  Conversation,
  Subscription,
  WeeklyContent,
  AppConfig,
  UserWithProfile,
  DoulaWithProfile,
  ConversationWithUsers,
  BroadcastWithDetails,
  BroadcastStatus,
  SubscriptionPlan,
  SubscriptionStatus,
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
  const { error } = await supabase
    .from('deletion_requests')
    .insert({ user_id: id, reason: 'Admin deleted', status: 'pending' });

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
  let query = supabase
    .from('profiles')
    .select(`
      *,
      doula_profiles (*)
    `, { count: 'exact' })
    .eq('user_role', 'doula');

  if (filters?.search) {
    query = query.or(`display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  let result = data as DoulaWithProfile[];
  
  if (filters?.isAvailable !== undefined) {
    result = result.filter(d => d.doula_profiles?.is_available === filters.isAvailable);
  }

  return { data: result, count: count || 0 };
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

export async function verifyDoula(id: string): Promise<void> {
  const { error } = await supabase
    .from('doula_profiles')
    .update({ is_verified: true })
    .eq('user_id', id);

  if (error) throw error;
}

export async function rejectDoula(id: string): Promise<void> {
  const { error } = await supabase
    .from('doula_profiles')
    .update({ is_verified: false })
    .eq('user_id', id);

  if (error) throw error;
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
