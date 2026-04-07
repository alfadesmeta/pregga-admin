export type UserRole = 'pregnant' | 'doula' | 'admin';
export type AuthProvider = 'phone' | 'email' | 'apple' | 'google';
export type BroadcastStatus = 'pending' | 'accepted' | 'cancelled' | 'expired' | 'no_doulas';
export type SubscriptionPlan = 'monthly' | 'pregnancy_postpartum' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  user_role: UserRole;
  auth_provider: AuthProvider | null;
  age: number | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  stream_chat_token: string | null;
  stream_chat_token_expires_at: string | null;
  push_token: string | null;
  push_platform: string | null;
  onboarding_step: number | null;
}

export interface PregnantProfile {
  id: string;
  user_id: string;
  due_date: string | null;
  is_trying_to_conceive: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DoulaProfile {
  id: string;
  user_id: string;
  bio: string | null;
  years_experience: number | null;
  expertise: string[] | null;
  is_online: boolean | null;
  is_available: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BroadcastRequest {
  id: string;
  pregnant_user_id: string;
  status: BroadcastStatus;
  accepted_by_doula_id: string | null;
  stream_channel_id: string | null;
  initial_message: string | null;
  created_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  notified_doula_ids: string[] | null;
}

export interface BroadcastRejection {
  id: string;
  request_id: string;
  doula_id: string;
  rejected_at: string;
}

export interface Conversation {
  id: string;
  pregnant_user_id: string;
  doula_id: string;
  stream_channel_id: string;
  broadcast_request_id: string | null;
  is_active: boolean | null;
  started_at: string | null;
  ended_at: string | null;
  ended_by: string | null;
  last_message: string | null;
  last_message_at: string | null;
  has_unread_user: boolean | null;
  has_unread_doula: boolean | null;
  last_message_sender_id: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  rc_customer_id: string | null;
  entitlement: string | null;
  product_id: string | null;
  plan_type: SubscriptionPlan | null;
  status: SubscriptionStatus | null;
  store: string | null;
  purchased_at: string | null;
  expiration_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyContent {
  id: string;
  week_number: number;
  affirmation: string | null;
  content_body: string | null;
  illustration_url: string | null;
  baby_size_comparison: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppConfig {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface DeletionRequest {
  id: string;
  user_id: string;
  user_email: string | null;
  user_role: string | null;
  reason: string | null;
  status: string;
  requested_at: string;
  expires_at: string | null;
  completed_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface MessageWithSender extends Message {
  sender: Profile;
}

export interface UserWithProfile extends Profile {
  pregnant_profiles: PregnantProfile | null;
  subscriptions: Subscription[];
}

export interface DoulaWithProfile extends Profile {
  doula_profiles: DoulaProfile | null;
}

export interface ConversationWithUsers extends Conversation {
  pregnant_user: Profile;
  doula: Profile;
}

export interface BroadcastWithDetails extends BroadcastRequest {
  user: Profile;
  accepted_doula: Profile | null;
  rejections: (BroadcastRejection & { doula: Profile })[];
}
