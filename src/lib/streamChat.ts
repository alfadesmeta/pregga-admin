import { StreamChat, type MessageResponse } from 'stream-chat';
import { supabase } from './supabase';

let clientInstance: StreamChat | null = null;
let connectPromise: Promise<void> | null = null;

function getApiKey(): string {
  const key = import.meta.env.VITE_STREAM_CHAT_API_KEY;
  if (!key) {
    throw new Error('VITE_STREAM_CHAT_API_KEY not set in .env');
  }
  return key;
}

async function fetchStreamToken(): Promise<{ token: string; userId: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-stream-token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to get Stream token: ${response.status}`);
  }

  const { token } = await response.json();
  return { token, userId: session.user.id };
}

export async function getStreamClient(): Promise<StreamChat> {
  if (clientInstance?.userID) return clientInstance;

  if (connectPromise) {
    await connectPromise;
    if (clientInstance?.userID) return clientInstance;
  }

  connectPromise = (async () => {
    const apiKey = getApiKey();

    if (clientInstance?.userID) {
      await clientInstance.disconnectUser();
    }

    clientInstance = new StreamChat(apiKey);
    const { token, userId } = await fetchStreamToken();
    await clientInstance.connectUser({ id: userId }, token);
  })();

  await connectPromise;
  connectPromise = null;

  return clientInstance!;
}

export async function disconnectStreamClient(): Promise<void> {
  connectPromise = null;
  if (clientInstance) {
    try {
      await clientInstance.disconnectUser();
    } catch { /* ignore */ }
    clientInstance = null;
  }
}

export interface StreamAttachment {
  type?: string;
  image_url?: string;
  thumb_url?: string;
  asset_url?: string;
  title?: string;
  mime_type?: string;
}

export interface StreamMessage {
  id: string;
  text: string;
  user: {
    id: string;
    name?: string;
    image?: string;
  };
  created_at: string;
  type: string;
  attachments: StreamAttachment[];
  status: string;
}

async function queryChannelMessages(
  channelId: string,
  limit: number,
  offsetMessageId?: string,
): Promise<{ messages: StreamMessage[]; hasMore: boolean }> {
  const client = await getStreamClient();
  const channel = client.channel('messaging', channelId);

  const queryOptions: Record<string, unknown> = { limit };
  if (offsetMessageId) {
    queryOptions.id_lt = offsetMessageId;
  }

  const response = await channel.query({
    messages: queryOptions,
    watch: true,
  });

  const messages: StreamMessage[] = (response.messages || []).map((msg: MessageResponse) => ({
    id: msg.id,
    text: msg.text || '',
    user: {
      id: msg.user?.id || '',
      name: msg.user?.name || undefined,
      image: msg.user?.image || undefined,
    },
    created_at: msg.created_at || new Date().toISOString(),
    type: msg.type || 'regular',
    attachments: (msg.attachments || []).map((a) => ({
      type: a.type,
      image_url: a.image_url,
      thumb_url: a.thumb_url,
      asset_url: a.asset_url,
      title: a.title,
      mime_type: a.mime_type,
    })),
    status: msg.status || 'received',
  }));

  return { messages, hasMore: messages.length >= limit };
}

export async function fetchStreamMessages(
  channelId: string,
  limit: number = 50,
  offsetMessageId?: string
): Promise<{ messages: StreamMessage[]; hasMore: boolean }> {
  try {
    return await queryChannelMessages(channelId, limit, offsetMessageId);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    const code = (err as { code?: number })?.code;
    if (status === 403 || code === 17) {
      console.warn('Stream Chat 403 - reconnecting with fresh token...');
      await disconnectStreamClient();
      try {
        return await queryChannelMessages(channelId, limit, offsetMessageId);
      } catch (retryErr) {
        console.error('Failed after reconnect:', retryErr);
      }
    } else {
      console.error('Failed to fetch Stream messages:', err);
    }
    return { messages: [], hasMore: false };
  }
}
