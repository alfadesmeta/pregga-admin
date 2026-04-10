import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { useSupabasePaginatedQuery, useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { ShimmerListItem } from "../../ui/Shimmer";
import {
  fetchConversations,
  fetchConversationById,
  fetchConversationTabCounts,
  type ConversationFilters,
} from "../../../lib/api";
import { formatTimeAgo } from "../../../lib/formatTime";
import { fetchStreamMessages, subscribeToChannel, type StreamMessage } from "../../../lib/streamChat";
import { friendlyError } from "../../../lib/errors";
import type { ConversationWithUsers, Profile } from "../../../types/database";
import {
  Search,
  MessageCircle,
  Archive,
  X,
  AlertCircle,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Shield,
  CheckCheck,
  Copy,
} from "lucide-react";

interface ChatViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (subView: string) => void;
  onGoBack?: () => void;
}

type ChatSubView = 
  | { type: 'detail'; conversationId: string }
  | { type: 'messages'; conversationId: string }
  | null;

function parseSubView(subView?: string): ChatSubView {
  if (!subView) return null;
  if (subView.startsWith('messages-')) {
    return { type: 'messages', conversationId: subView.replace('messages-', '') };
  }
  return { type: 'detail', conversationId: subView };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CopyableId({ id }: { id: string }) {
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: "monospace", fontSize: 12, color: PreggaColors.neutral500 }}>
        {id.slice(0, 8)}...
      </span>
      <button
        onClick={handleCopy}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: 4,
          border: "none",
          background: "transparent",
          color: PreggaColors.neutral400,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = PreggaColors.neutral100;
          e.currentTarget.style.color = PreggaColors.neutral600;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = PreggaColors.neutral400;
        }}
        title="Copy ID"
      >
        <Copy size={14} />
      </button>
    </div>
  );
}

export function ChatView({ isMobile, subView, onNavigateToSubView, onGoBack }: ChatViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("all");

  const filters: ConversationFilters = {
    isActive: activeTab === "all" ? undefined : activeTab === "active" ? true : false,
    search: searchQuery || undefined,
  };

  const {
    data: conversations,
    isLoading,
    error,
    refetch,
  } = useSupabasePaginatedQuery<ConversationWithUsers>(
    ['conversations', JSON.stringify(filters), searchQuery],
    (from, to) => fetchConversations(from, to, filters),
    { pageSize: 50 }
  );

  const { data: tabCounts } = useSupabaseQuery(
    ['conversations', 'tab-counts'],
    () => fetchConversationTabCounts()
  );

  const activeCount = tabCounts?.active ?? 0;
  const archivedCount = tabCounts?.archived ?? 0;

  const handleSelectConversation = (id: string) => {
    onNavigateToSubView?.(id);
  };

  const handleGoBack = () => {
    onGoBack?.();
  };

  const parsed = parseSubView(subView);
  
  if (parsed?.type === 'messages' || parsed?.type === 'detail') {
    return (
      <ConversationDetailView
        conversationId={parsed.conversationId}
        onGoBack={handleGoBack}
        onRefresh={refetch}
        isMobile={isMobile}
      />
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load conversations</h3>
        <p style={{ color: PreggaColors.neutral500 }}>{friendlyError(error)}</p>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Conversation List Card */}
      <div
        style={{
          background: PreggaColors.white,
          borderRadius: 16,
          border: `1px solid ${PreggaColors.secondary300}`,
          overflow: "hidden",
        }}
      >
        {/* Header with Tabs and Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "16px" : "16px 24px",
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: 12,
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: PreggaColors.white,
              borderRadius: 10,
              padding: 4,
              border: `1px solid ${PreggaColors.secondary300}`,
            }}
          >
            {([
              { id: "all" as const, label: `All (${activeCount + archivedCount})`, icon: <MessageCircle size={14} /> },
              { id: "active" as const, label: `Active (${activeCount})`, icon: <MessageCircle size={14} /> },
              { id: "archived" as const, label: `Archived (${archivedCount})`, icon: <Archive size={14} /> },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: activeTab === tab.id ? `1px solid ${PreggaColors.secondary300}` : "1px solid transparent",
                  background: activeTab === tab.id ? PreggaColors.secondary100 : "transparent",
                  color: activeTab === tab.id ? PreggaColors.neutral900 : PreggaColors.neutral500,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  outline: "none",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ width: isMobile ? "100%" : 260 }}>
            <Input
              placeholder="Search by user or doula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
              showClear
              onClear={() => setSearchQuery("")}
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div>
          {isLoading ? (
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ borderBottom: i < 5 ? `1px solid ${PreggaColors.neutral100}` : "none" }}>
                  <ShimmerListItem delay={i * 60} />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: PreggaColors.neutral100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <MessageCircle size={24} color={PreggaColors.neutral400} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 4px" }}>
                No {activeTab === "all" ? "" : activeTab === "active" ? "active " : "archived "}conversations
              </h3>
              <p style={{ color: PreggaColors.neutral500, fontSize: 14, margin: 0 }}>
                {activeTab === "active" 
                  ? "When users start chatting with doulas, they'll appear here"
                  : activeTab === "archived"
                  ? "Ended conversations will appear here"
                  : "No conversations found"
                }
              </p>
            </div>
          ) : (
            conversations.map((conv, index) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                onClick={() => handleSelectConversation(conv.id)}
                isLast={index === conversations.length - 1}
                isMobile={isMobile}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationListItem({
  conversation,
  onClick,
  isLast,
  isMobile,
}: {
  conversation: ConversationWithUsers;
  onClick: () => void;
  isLast: boolean;
  isMobile: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const getStatusInfo = (conv: ConversationWithUsers) => {
    if (conv.is_active) {
      return { label: "Active", variant: "success" as const };
    }
    return { label: "Closed", variant: "neutral" as const };
  };

  const status = getStatusInfo(conversation);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 12 : 16,
        padding: isMobile ? "14px 16px" : "16px 24px",
        borderBottom: isLast ? "none" : `1px solid ${PreggaColors.neutral100}`,
        cursor: "pointer",
        background: hovered ? PreggaColors.neutral50 : "transparent",
        transition: "background 0.15s ease",
      }}
    >
      {/* Avatar with online indicator */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: PreggaColors.rose100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PreggaColors.rose600,
            fontSize: 14,
            fontWeight: 600,
            overflow: "hidden",
          }}
        >
          {conversation.pregnant_user?.avatar_url ? (
            <img src={conversation.pregnant_user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            getInitials(conversation.pregnant_user?.display_name)
          )}
        </div>
        {conversation.is_active && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: PreggaColors.success500,
              border: `2px solid ${PreggaColors.white}`,
            }}
          />
        )}
      </div>

      {/* User Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: PreggaColors.neutral900 }}>
            {conversation.pregnant_user?.display_name || "Unknown User"}
          </span>
          {!isMobile && <CopyableId id={conversation.id} />}
        </div>
        <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 2 }}>
          {conversation.pregnant_user?.phone ? "TTC" : "Pregnant"} • with {conversation.doula?.display_name || "Unknown Doula"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: PreggaColors.neutral400,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {conversation.last_message || "No messages yet"}
        </div>
      </div>

      {/* Status Badge */}
      <Badge variant={status.variant} size="sm">
        {status.label}
      </Badge>

      {/* Time ago */}
      <div style={{ fontSize: 12, color: PreggaColors.neutral400, minWidth: isMobile ? 60 : 80, textAlign: "right" }}>
        {formatTimeAgo(conversation.started_at || conversation.last_message_at || "")}
      </div>
    </div>
  );
}

function ConversationDetailView({
  conversationId,
  onGoBack,
  onRefresh: _onRefresh,
  isMobile,
}: {
  conversationId: string;
  onGoBack: () => void;
  onRefresh: () => void;
  isMobile: boolean;
}) {
  const { data: conversation, isLoading, error } = useSupabaseQuery<ConversationWithUsers | null>(
    ['conversation', conversationId],
    () => fetchConversationById(conversationId)
  );

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Loader2 size={24} color={PreggaColors.sage500} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Conversation not found</h3>
        <Button onClick={onGoBack} style={{ marginTop: 16 }}>Go Back</Button>
      </div>
    );
  }

  const pregnantUser = conversation.pregnant_user;
  const doula = conversation.doula;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Read-only notice */}
      <div
        style={{
          fontSize: 13,
          color: PreggaColors.neutral500,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Shield size={14} />
        Read-only view for admin monitoring
      </div>

      {/* Header Card */}
      <div
        style={{
          background: PreggaColors.white,
          borderRadius: 16,
          border: `1px solid ${PreggaColors.secondary300}`,
          borderTop: `3px solid ${PreggaColors.sage500}`,
          overflow: "hidden",
        }}
      >
        {/* Top Row - Back, Avatar, Name/Email, Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: isMobile ? "16px" : "20px 24px",
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
          }}
        >
          <button
            onClick={onGoBack}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: PreggaColors.neutral200,
              background: PreggaColors.white,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.neutral500,
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = PreggaColors.neutral50;
              e.currentTarget.style.borderWidth = "1px";
              e.currentTarget.style.borderStyle = "solid";
              e.currentTarget.style.borderColor = PreggaColors.neutral300;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PreggaColors.white;
              e.currentTarget.style.borderWidth = "1px";
              e.currentTarget.style.borderStyle = "solid";
              e.currentTarget.style.borderColor = PreggaColors.neutral200;
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: PreggaColors.sage100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.sage600,
              fontSize: 16,
              fontWeight: 600,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {pregnantUser?.avatar_url ? (
              <img src={pregnantUser.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (pregnantUser?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>
                {pregnantUser?.display_name || "Unknown User"}
              </h2>
              <Badge variant={conversation.is_active ? "success" : "neutral"} size="sm">
                {conversation.is_active ? "Active" : "Closed"}
              </Badge>
            </div>
            <div style={{ fontSize: 13, color: PreggaColors.neutral500, marginTop: 2 }}>
              {pregnantUser?.email || pregnantUser?.phone || "No contact info"}
            </div>
          </div>
        </div>

        {/* Stats Row - Label on top, value below */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: isMobile ? "16px" : "20px 24px",
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: PreggaColors.sage600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
              With Doula
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              {doula?.display_name || "Unknown"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: PreggaColors.sage600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
              Started
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              {formatDate(conversation.started_at || "")}
            </div>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <MessageTranscript
        streamChannelId={conversation.stream_channel_id}
        pregnantUser={pregnantUser as Profile}
        doula={doula as Profile}
        isMobile={isMobile}
        conversation={conversation}
      />

    </div>
  );
}

interface StreamMessageData {
  id: string;
  text: string;
  userId: string;
  userName?: string;
  created_at: string;
  attachments: { type?: string; image_url?: string; thumb_url?: string }[];
  status: string;
  type: string;
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out", animation: "modalFadeIn 0.15s ease-out",
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", border: "none",
          color: "#fff", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw", maxHeight: "90vh",
          borderRadius: 12, objectFit: "contain",
          cursor: "default",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      />
    </div>,
    document.body
  );
}

let setGlobalLightbox: ((src: string | null) => void) | null = null;

function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    setGlobalLightbox = setLightboxSrc;
    return () => { setGlobalLightbox = null; };
  }, []);

  return (
    <>
      {children}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </>
  );
}

function openLightbox(src: string) {
  setGlobalLightbox?.(src);
}

function MessageAttachments({ attachments, isDoula }: { attachments: StreamMessageData['attachments']; isDoula: boolean }) {
  const images = attachments.filter((a) => a.type === 'image' || a.image_url || a.thumb_url);
  if (images.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {images.map((img, idx) => {
        const src = img.image_url || img.thumb_url || '';
        return (
          <div
            key={idx}
            onClick={() => openLightbox(src)}
            style={{
              borderRadius: 8,
              overflow: "hidden",
              border: isDoula ? "1px solid #E3E0D9" : "none",
              background: isDoula ? PreggaColors.white : "#5C7049",
              padding: 4,
              maxWidth: 200,
              cursor: "zoom-in",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: "100%",
                borderRadius: 6,
                display: "block",
                maxHeight: 200,
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function MessageTimestamp({ time, status, isDoula }: { time: string; status: string; isDoula: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 11, color: "#9C9289" }}>{time}</span>
      {!isDoula && (
        <CheckCheck
          size={13}
          style={{
            color: status === 'received' ? "#7DA87D" : "#D6CCC2",
          }}
        />
      )}
    </div>
  );
}

function SystemEventBubble({ text, time }: { text: string; time?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#EFEEE7",
          borderRadius: 20,
          padding: "6px 14px",
          maxWidth: "85%",
        }}
      >
        <Shield size={12} style={{ color: "#9C9289", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#80776E", lineHeight: "16px" }}>
          {text}
        </span>
        {time && (
          <span style={{ fontSize: 10, color: "#9C9289", whiteSpace: "nowrap" }}>
            {time}
          </span>
        )}
      </div>
    </div>
  );
}

function injectLifecycleEvents(
  messages: StreamMessageData[],
  conversation?: { started_at?: string | null; ended_at?: string | null; is_active?: boolean | null } | null,
  doula?: { display_name?: string | null } | null,
): StreamMessageData[] {
  const result = [...messages];
  if (!conversation) return result;

  if (conversation.started_at) {
    const startEvent: StreamMessageData = {
      id: '__started__',
      text: `Chat session started${doula?.display_name ? ` with ${doula.display_name}` : ''}`,
      userId: '__system__',
      created_at: conversation.started_at,
      attachments: [],
      status: 'received',
      type: 'system',
    };
    const firstMsgTime = result.length > 0 ? new Date(result[0].created_at).getTime() : Infinity;
    if (new Date(conversation.started_at).getTime() <= firstMsgTime) {
      result.unshift(startEvent);
    }
  }

  if (conversation.ended_at && !conversation.is_active) {
    const endEvent: StreamMessageData = {
      id: '__ended__',
      text: 'Chat session ended',
      userId: '__system__',
      created_at: conversation.ended_at,
      attachments: [],
      status: 'received',
      type: 'system',
    };
    const lastMsgTime = result.length > 0 ? new Date(result[result.length - 1].created_at).getTime() : -Infinity;
    if (new Date(conversation.ended_at).getTime() >= lastMsgTime) {
      result.push(endEvent);
    }
  }

  return result;
}

function MessageTranscript({
  streamChannelId,
  pregnantUser,
  doula,
  isMobile,
  conversation,
}: {
  streamChannelId: string;
  pregnantUser: Profile;
  doula: Profile;
  isMobile: boolean;
  conversation?: ConversationWithUsers | null;
}) {
  const [messages, setMessages] = useState<StreamMessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const LIMIT = 30;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  };

  const loadMessages = async (beforeId?: string) => {
    if (beforeId) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const result = await fetchStreamMessages(streamChannelId, LIMIT, beforeId);
      const mapped = result.messages
        .filter((m) => m.type === 'regular' || m.type === 'system')
        .map((m) => ({
          id: m.id,
          text: m.text,
          userId: m.user.id,
          userName: m.user.name,
          created_at: m.created_at,
          attachments: m.attachments || [],
          status: m.status || 'received',
          type: m.type,
        }));

      if (beforeId) {
        setMessages((prev) => [...mapped, ...prev]);
      } else {
        setMessages(mapped);
        setTimeout(() => scrollToBottom(false), 100);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (streamChannelId) loadMessages();
  }, [streamChannelId]);

  useEffect(() => {
    if (!streamChannelId) return;

    let unsubscribe: (() => void) | null = null;

    subscribeToChannel(streamChannelId, (newMessage: StreamMessage) => {
      if (newMessage.type === 'regular' || newMessage.type === 'system') {
        const mappedMessage: StreamMessageData = {
          id: newMessage.id,
          text: newMessage.text,
          userId: newMessage.user.id,
          userName: newMessage.user.name,
          created_at: newMessage.created_at,
          attachments: newMessage.attachments || [],
          status: newMessage.status || 'received',
          type: newMessage.type,
        };
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev.map((m) => m.id === newMessage.id ? mappedMessage : m);
          }
          setTimeout(() => scrollToBottom(true), 100);
          return [...prev, mappedMessage];
        });
      }
    }).then((unsub) => {
      unsubscribe = unsub;
    }).catch(console.error);

    return () => {
      unsubscribe?.();
    };
  }, [streamChannelId]);

  const loadMore = () => {
    if (messages.length > 0) {
      loadMessages(messages[0].id);
    }
  };

  const formatMessageTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatMessageDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupMessagesByDate = (msgs: StreamMessageData[]) => {
    const groups: { date: string; messages: StreamMessageData[] }[] = [];
    let currentDate = "";

    msgs.forEach((msg) => {
      const msgDate = formatMessageDate(msg.created_at);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: currentDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const enrichedMessages = injectLifecycleEvents(messages, conversation, doula);
  const messageGroups = groupMessagesByDate(enrichedMessages);
  const doulaAvatar = doula?.avatar_url;
  const doulaInitials = (doula?.display_name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2);
  const userAvatar = pregnantUser?.avatar_url;
  const userInitials = (pregnantUser?.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <LightboxProvider>
    <div
      style={{
        background: "#F2F5EF",
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${PreggaColors.secondary300}`,
      }}
    >
      {isLoading ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <Loader2 size={24} color={PreggaColors.sage500} style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12, color: "#9C9289", fontSize: 14 }}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <MessageCircle size={32} color="#D6CCC2" style={{ marginBottom: 12 }} />
          <p style={{ color: "#9C9289", fontSize: 14, margin: 0 }}>No messages in this conversation</p>
        </div>
      ) : (
        <div style={{ maxHeight: isMobile ? 420 : 520, overflowY: "auto" }}>
          {hasMore && (
            <div style={{ padding: "12px 20px", textAlign: "center" }}>
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                style={{
                  background: PreggaColors.white,
                  border: `1px solid #E3E0D9`,
                  borderRadius: 20,
                  color: "#72845D",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: isLoadingMore ? "default" : "pointer",
                  padding: "6px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isLoadingMore ? (
                  <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Loading...</>
                ) : (
                  <><ChevronDown size={12} style={{ transform: "rotate(180deg)" }} /> Load older</>
                )}
              </button>
            </div>
          )}

          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messageGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                {/* Date divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 16px" }}>
                  <div style={{ flex: 1, height: 1, background: "#D6CCC2", opacity: 0.5 }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9C9289", whiteSpace: "nowrap" }}>
                    {group.date}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#D6CCC2", opacity: 0.5 }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {group.messages.map((msg) => {
                    if (msg.type === 'system') {
                      return <SystemEventBubble key={msg.id} text={msg.text} time={formatMessageTime(msg.created_at)} />;
                    }

                    const isDoula = msg.userId === doula?.id;
                    const senderName = isDoula ? doula?.display_name : (msg.userId === pregnantUser?.id ? pregnantUser?.display_name : msg.userName);

                    if (isDoula) {
                      return (
                        <div key={msg.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${PreggaColors.sage400}, ${PreggaColors.sage500})`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: PreggaColors.white, fontSize: 11, fontWeight: 600,
                              overflow: "hidden", flexShrink: 0,
                            }}
                          >
                            {doulaAvatar ? (
                              <img src={doulaAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : doulaInitials}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "75%" }}>
                            <span style={{ fontSize: 12, color: "#80776E" }}>
                              {senderName || "Doula"}
                            </span>
                            {msg.attachments.length > 0 && (
                              <MessageAttachments attachments={msg.attachments} isDoula={true} />
                            )}
                            {msg.text && (
                              <div
                                style={{
                                  background: PreggaColors.white,
                                  border: "1px solid #E3E0D9",
                                  borderRadius: "4px 16px 16px 16px",
                                  padding: "12px 16px",
                                }}
                              >
                                <p style={{ fontSize: 14, color: "#544D4D", margin: 0, lineHeight: "22px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                  {msg.text}
                                </p>
                              </div>
                            )}
                            <MessageTimestamp time={formatMessageTime(msg.created_at)} status={msg.status} isDoula={true} />
                          </div>
                        </div>
                      );
                    }

                    const userName = msg.userId === pregnantUser?.id ? pregnantUser?.display_name : msg.userName;
                    return (
                      <div key={msg.id} style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end", maxWidth: "75%" }}>
                          <span style={{ fontSize: 12, color: "#80776E" }}>
                            {userName || "User"}
                          </span>
                          {msg.attachments.length > 0 && (
                            <MessageAttachments attachments={msg.attachments} isDoula={false} />
                          )}
                          {msg.text && (
                            <div
                              style={{
                                background: "#72845D",
                                borderRadius: "16px 4px 16px 16px",
                                padding: "12px 16px",
                              }}
                            >
                              <p style={{ fontSize: 14, color: PreggaColors.white, margin: 0, lineHeight: "22px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {msg.text}
                              </p>
                            </div>
                          )}
                          <MessageTimestamp time={formatMessageTime(msg.created_at)} status={msg.status} isDoula={false} />
                        </div>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${PreggaColors.primary400 || "#C4956A"}, ${PreggaColors.primary500 || "#B07D52"})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: PreggaColors.white, fontSize: 11, fontWeight: 600,
                            overflow: "hidden", flexShrink: 0,
                          }}
                        >
                          {userAvatar ? (
                            <img src={userAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : userInitials}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Read-only footer */}
      <div
        style={{
          background: PreggaColors.white,
          borderTop: "1px solid #EFEEE7",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            background: "#F0F5F0",
            border: "1px solid #E3E0D9",
            borderRadius: 24,
            padding: "12px 16px",
          }}
        >
          <span style={{ fontSize: 14, color: "#9C9289" }}>Read-only admin view</span>
        </div>
      </div>
    </div>
    </LightboxProvider>
  );
}
