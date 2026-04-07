import { PostgrestError, AuthError } from '@supabase/supabase-js';

interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  '23505': 'This record already exists.',
  '23503': 'Cannot delete this record because it is referenced by other data.',
  '23502': 'Required field is missing.',
  '42501': 'You do not have permission to perform this action.',
  'PGRST116': 'Record not found.',
  'PGRST204': 'No data returned.',
  'invalid_credentials': 'Invalid email or password.',
  'email_not_confirmed': 'Please verify your email address.',
  'user_not_found': 'User not found.',
  'invalid_grant': 'Invalid login credentials.',
  'email_taken': 'This email is already registered.',
  'phone_taken': 'This phone number is already registered.',
  'weak_password': 'Password is too weak. Please use at least 8 characters.',
  'over_request_rate_limit': 'Too many requests. Please try again later.',
  'over_email_send_rate_limit': 'Too many email requests. Please try again later.',
  'session_not_found': 'Session expired. Please log in again.',
  'refresh_token_not_found': 'Session expired. Please log in again.',
  'user_banned': 'This account has been suspended.',
  'bad_jwt': 'Session expired. Please log in again.',
  'not_admin': 'Admin access required.',
  'validation_failed': 'Please check your input and try again.',
};

const NETWORK_ERROR_MESSAGES = [
  'Failed to fetch',
  'Network request failed',
  'NetworkError',
  'net::ERR_',
];

function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return NETWORK_ERROR_MESSAGES.some(msg => 
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }
  return false;
}

export function friendlyError(error: unknown): string {
  if (!error) {
    return 'An unexpected error occurred.';
  }

  if (isNetworkError(error)) {
    return 'Unable to connect. Please check your internet connection.';
  }

  if (error instanceof AuthError) {
    const code = error.message.toLowerCase().replace(/ /g, '_');
    return ERROR_MESSAGES[code] || error.message;
  }

  if (isPostgrestError(error)) {
    const pgError = error as PostgrestError;
    
    if (pgError.code && ERROR_MESSAGES[pgError.code]) {
      return ERROR_MESSAGES[pgError.code];
    }
    
    if (pgError.message.includes('duplicate key')) {
      return 'This record already exists.';
    }
    
    if (pgError.message.includes('violates foreign key')) {
      return 'Cannot delete this record because it is referenced by other data.';
    }
    
    if (pgError.message.includes('permission denied')) {
      return 'You do not have permission to perform this action.';
    }
    
    return pgError.message;
  }

  if (isSupabaseError(error)) {
    const supaError = error as SupabaseError;
    
    if (supaError.code && ERROR_MESSAGES[supaError.code]) {
      return ERROR_MESSAGES[supaError.code];
    }
    
    return supaError.message;
  }

  if (error instanceof Error) {
    const code = error.message.toLowerCase().replace(/ /g, '_');
    return ERROR_MESSAGES[code] || error.message;
  }

  if (typeof error === 'string') {
    const code = error.toLowerCase().replace(/ /g, '_');
    return ERROR_MESSAGES[code] || error;
  }

  return 'An unexpected error occurred. Please try again.';
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    ('code' in error || 'details' in error || 'hint' in error)
  );
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as SupabaseError).message === 'string'
  );
}

export function getErrorCode(error: unknown): string | null {
  if (error instanceof AuthError) {
    return error.message.toLowerCase().replace(/ /g, '_');
  }
  
  if (isPostgrestError(error)) {
    return (error as PostgrestError).code || null;
  }
  
  if (isSupabaseError(error)) {
    return (error as SupabaseError).code || null;
  }
  
  return null;
}

export function isAuthError(error: unknown): boolean {
  return error instanceof AuthError;
}

export function isPermissionError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === '42501' || friendlyError(error).includes('permission');
}

export function isNotFoundError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === 'PGRST116' || code === 'PGRST204';
}
