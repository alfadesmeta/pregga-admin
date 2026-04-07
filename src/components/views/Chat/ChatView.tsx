import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCountUp, useSupabasePaginatedQuery, useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Modal } from "../../ui/Modal";
import { ShimmerListItem } from "../../ui/Shimmer";
import {
  fetchConversations,
  fetchConversationById,
  fetchConversationMessages,
  endConversation,
  reactivateConversation,
  type ConversationFilters,
} from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { ConversationWithUsers, Profile } from "../../../types/database";
import {
  Search,
  MessageCircle,
  Archive,
  User,
  Heart,
  X,
  AlertCircle,
  Play,
  Pause,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Calendar,
  Shield,
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

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function ChatView({ isMobile, subView, onNavigateToSubView, onGoBack }: ChatViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  const filters: ConversationFilters = {
    isActive: activeTab === "active" ? true : false,
    search: searchQuery || undefined,
  };

  const {
    data: conversations,
    count,
    isLoading,
    error,
    refetch,
  } = useSupabasePaginatedQuery<ConversationWithUsers>(
    ['conversations', JSON.stringify(filters), searchQuery],
    (from, to) => fetchConversations(from, to, filters),
    { pageSize: 50 }
  );

  const { data: allConversations } = useSupabasePaginatedQuery<ConversationWithUsers>(
    ['conversations', 'all'],
    (from, to) => fetchConversations(from, to, {}),
    { pageSize: 100 }
  );

  const activeCount = allConversations?.filter(c => c.is_active).length || 0;
  const archivedCount = allConversations?.filter(c => !c.is_active).length || 0;

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
          {/* Tabs - Styled like Doulas page */}
          <div
            style={{
              display: "flex",
              background: PreggaColors.white,
              borderRadius: 10,
              padding: 4,
              border: `1px solid ${PreggaColors.secondary300}`,
            }}
          >
            <button
              onClick={() => setActiveTab("active")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: activeTab === "active" ? `1px solid ${PreggaColors.secondary300}` : "1px solid transparent",
                background: activeTab === "active" ? PreggaColors.secondary100 : "transparent",
                color: activeTab === "active" ? PreggaColors.neutral900 : PreggaColors.neutral500,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              <MessageCircle size={14} />
              Active ({activeCount})
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 8,
                border: activeTab === "archived" ? `1px solid ${PreggaColors.secondary300}` : "1px solid transparent",
                background: activeTab === "archived" ? PreggaColors.secondary100 : "transparent",
                color: activeTab === "archived" ? PreggaColors.neutral900 : PreggaColors.neutral500,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              <Archive size={14} />
              Archived ({archivedCount})
            </button>
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
                No {activeTab === "active" ? "active" : "archived"} conversations
              </h3>
              <p style={{ color: PreggaColors.neutral500, fontSize: 14, margin: 0 }}>
                {activeTab === "active" 
                  ? "When users start chatting with doulas, they'll appear here"
                  : "Ended conversations will appear here"
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

      {/* Messages count - hide on mobile */}
      {!isMobile && (
        <div style={{ textAlign: "center", minWidth: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: PreggaColors.neutral500, fontSize: 13 }}>
            <MessageCircle size={14} />
            <span style={{ fontWeight: 500 }}>—</span>
          </div>
          <div style={{ fontSize: 11, color: PreggaColors.neutral400 }}>messages</div>
        </div>
      )}

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
  onRefresh,
  isMobile,
}: {
  conversationId: string;
  onGoBack: () => void;
  onRefresh: () => void;
  isMobile: boolean;
}) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: conversation, isLoading, error, refetch } = useSupabaseQuery<ConversationWithUsers | null>(
    ['conversation', conversationId],
    () => fetchConversationById(conversationId)
  );

  const handleToggleStatus = async () => {
    if (!conversation) return;
    setIsProcessing(true);
    try {
      if (conversation.is_active) {
        await endConversation(conversation.id);
        toast.success("Conversation ended");
      } else {
        await reactivateConversation(conversation.id);
        toast.success("Conversation reactivated");
      }
      refetch();
      onRefresh();
      setShowActionModal(false);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setIsProcessing(false);
    }
  };

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
              border: `1px solid ${PreggaColors.neutral200}`,
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
              e.currentTarget.style.borderColor = PreggaColors.neutral300;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PreggaColors.white;
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
        conversationId={conversationId}
        pregnantUser={pregnantUser as Profile}
        doula={doula as Profile}
        isMobile={isMobile}
      />

      {/* Action Button */}
      <div style={{ display: "flex", gap: 12 }}>
        <Button
          variant="outline"
          onClick={() => setShowActionModal(true)}
          icon={conversation.is_active ? <Pause size={16} /> : <Play size={16} />}
        >
          {conversation.is_active ? "End Conversation" : "Reactivate"}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showActionModal}
        onClose={() => setShowActionModal(false)}
        title=""
        width={400}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>Cancel</Button>
            <Button
              onClick={handleToggleStatus}
              loading={isProcessing}
              style={{ background: conversation.is_active ? PreggaColors.warning500 : PreggaColors.success500 }}
            >
              {conversation.is_active ? "End Conversation" : "Reactivate"}
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: conversation.is_active ? PreggaColors.warning100 : PreggaColors.success100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            {conversation.is_active ? <Pause size={28} color={PreggaColors.warning600} /> : <Play size={28} color={PreggaColors.success600} />}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>
            {conversation.is_active ? "End this conversation?" : "Reactivate this conversation?"}
          </h3>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: 0, lineHeight: 1.5 }}>
            {conversation.is_active
              ? "This will freeze the chat channel and prevent further messages."
              : "This will unfreeze the chat channel and allow messaging to resume."
            }
          </p>
        </div>
      </Modal>
    </div>
  );
}

interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender: Profile;
}

function MessageTranscript({
  conversationId,
  pregnantUser,
  doula,
  isMobile,
}: {
  conversationId: string;
  pregnantUser: Profile;
  doula: Profile;
  isMobile: boolean;
}) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 30;

  const loadMessages = async (newOffset: number = 0, append: boolean = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const result = await fetchConversationMessages(conversationId, LIMIT, newOffset);
      if (append) {
        setMessages((prev) => [...result.data, ...prev]);
      } else {
        setMessages(result.data as MessageData[]);
      }
      setTotalCount(result.count);
      setHasMore(newOffset + LIMIT < result.count);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadMessages(0);
  }, [conversationId]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadMessages(newOffset, true);
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

  const groupMessagesByDate = (msgs: MessageData[]) => {
    const groups: { date: string; messages: MessageData[] }[] = [];
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

  const messageGroups = groupMessagesByDate(messages);

  return (
    <Card padding="0">
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>
            Message Transcript
          </h3>
          <span style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
            {totalCount} message{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Loader2 size={24} color={PreggaColors.sage500} style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 12, color: PreggaColors.neutral500, fontSize: 14 }}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <MessageCircle size={32} color={PreggaColors.neutral300} style={{ marginBottom: 12 }} />
          <p style={{ color: PreggaColors.neutral500, fontSize: 14, margin: 0 }}>No messages in this conversation</p>
        </div>
      ) : (
        <div style={{ maxHeight: isMobile ? 400 : 500, overflowY: "auto" }}>
          {hasMore && (
            <div style={{ padding: "12px 20px", textAlign: "center", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                style={{
                  background: "none",
                  border: "none",
                  color: PreggaColors.sage600,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isLoadingMore ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  margin: "0 auto",
                }}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Load older messages
                  </>
                )}
              </button>
            </div>
          )}

          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messageGroups.map((group, groupIdx) => (
              <div key={groupIdx}>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: PreggaColors.neutral500,
                      background: PreggaColors.neutral50,
                      padding: "4px 12px",
                      borderRadius: 12,
                    }}
                  >
                    {group.date}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {group.messages.map((msg) => {
                    const isUser = msg.sender_id === pregnantUser?.id;
                    const senderName = isUser ? pregnantUser?.display_name : doula?.display_name;

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          flexDirection: isUser ? "row" : "row-reverse",
                          gap: 10,
                          alignItems: "flex-end",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "75%",
                            background: isUser ? PreggaColors.sage50 : PreggaColors.terracotta50,
                            borderRadius: isUser ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                            padding: "10px 14px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: isUser ? PreggaColors.sage700 : PreggaColors.terracotta700,
                              marginBottom: 4,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {isUser ? <User size={12} /> : <Heart size={12} />}
                            {senderName || (isUser ? "User" : "Doula")}
                          </div>
                          <p
                            style={{
                              fontSize: 14,
                              color: PreggaColors.neutral900,
                              margin: 0,
                              lineHeight: 1.5,
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.content}
                          </p>
                          <div
                            style={{
                              fontSize: 10,
                              color: PreggaColors.neutral400,
                              marginTop: 4,
                              textAlign: "right",
                            }}
                          >
                            {formatMessageTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function FullChatView({
  conversationId,
  onGoBack,
  isMobile,
}: {
  conversationId: string;
  onGoBack: () => void;
  isMobile: boolean;
}) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 50;

  const { data: conversation } = useSupabaseQuery<ConversationWithUsers | null>(
    ['conversation', conversationId],
    () => fetchConversationById(conversationId)
  );

  const loadMessages = async (newOffset: number = 0, append: boolean = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const result = await fetchConversationMessages(conversationId, LIMIT, newOffset);
      if (append) {
        setMessages((prev) => [...result.data, ...prev]);
      } else {
        setMessages(result.data as MessageData[]);
      }
      setTotalCount(result.count);
      setHasMore(newOffset + LIMIT < result.count);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadMessages(0);
  }, [conversationId]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    loadMessages(newOffset, true);
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
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupMessagesByDate = (msgs: MessageData[]) => {
    const groups: { date: string; messages: MessageData[] }[] = [];
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

  const messageGroups = groupMessagesByDate(messages);
  const pregnantUser = conversation?.pregnant_user;
  const doula = conversation?.doula;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", minHeight: 500 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 0",
          borderBottom: `1px solid ${PreggaColors.neutral100}`,
          marginBottom: 16,
        }}
      >
        <button
          onClick={onGoBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: PreggaColors.neutral600,
            padding: 8,
            borderRadius: 8,
            display: "flex",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.neutral100)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>
            Chat History
          </h1>
          <p style={{ fontSize: 13, color: PreggaColors.neutral500, margin: "2px 0 0" }}>
            {pregnantUser?.display_name || "User"} & {doula?.display_name || "Doula"} • {totalCount} messages
          </p>
        </div>
        {conversation && (
          <Badge variant={conversation.is_active ? "sage" : "neutral"}>
            {conversation.is_active ? "Active" : "Ended"}
          </Badge>
        )}
      </div>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          background: PreggaColors.white,
          borderRadius: 16,
          border: `1px solid ${PreggaColors.secondary300}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Participants Bar */}
        <div
          style={{
            padding: "12px 20px",
            background: PreggaColors.neutral50,
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: PreggaColors.sage100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PreggaColors.sage600,
                  overflow: "hidden",
                }}
              >
                {pregnantUser?.avatar_url ? (
                  <img src={pregnantUser.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700 }}>
                {pregnantUser?.display_name || "User"}
              </span>
            </div>
            <span style={{ color: PreggaColors.neutral300 }}>•</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: PreggaColors.terracotta100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PreggaColors.terracotta600,
                  overflow: "hidden",
                }}
              >
                {doula?.avatar_url ? (
                  <img src={doula.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Heart size={16} />
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700 }}>
                {doula?.display_name || "Doula"}
              </span>
            </div>
          </div>
          <span style={{ fontSize: 12, color: PreggaColors.neutral400 }}>Read-only</span>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: "auto", background: PreggaColors.bgSecondary }}>
          {isLoading ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <Loader2 size={32} color={PreggaColors.sage500} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, color: PreggaColors.neutral500, fontSize: 14 }}>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: PreggaColors.neutral100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <MessageCircle size={28} color={PreggaColors.neutral400} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 4px" }}>
                No messages yet
              </h3>
              <p style={{ color: PreggaColors.neutral500, fontSize: 14, margin: 0 }}>
                This conversation has no messages
              </p>
            </div>
          ) : (
            <div>
              {hasMore && (
                <div style={{ padding: "16px 20px", textAlign: "center" }}>
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    style={{
                      background: PreggaColors.white,
                      border: `1px solid ${PreggaColors.secondary300}`,
                      borderRadius: 8,
                      padding: "10px 20px",
                      color: PreggaColors.sage600,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: isLoadingMore ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} style={{ transform: "rotate(180deg)" }} />
                        Load older messages
                      </>
                    )}
                  </button>
                </div>
              )}

              <div style={{ padding: isMobile ? "12px 16px" : "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
                {messageGroups.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: PreggaColors.neutral500,
                          background: PreggaColors.white,
                          padding: "6px 16px",
                          borderRadius: 16,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      >
                        {group.date}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {group.messages.map((msg) => {
                        const isUser = msg.sender_id === pregnantUser?.id;
                        const senderName = isUser ? pregnantUser?.display_name : doula?.display_name;

                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              flexDirection: isUser ? "row" : "row-reverse",
                              gap: 10,
                              alignItems: "flex-end",
                            }}
                          >
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: isUser ? PreggaColors.sage100 : PreggaColors.terracotta100,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: isUser ? PreggaColors.sage600 : PreggaColors.terracotta600,
                                flexShrink: 0,
                                fontSize: 12,
                              }}
                            >
                              {isUser ? <User size={14} /> : <Heart size={14} />}
                            </div>
                            <div
                              style={{
                                maxWidth: isMobile ? "80%" : "60%",
                                background: isUser ? PreggaColors.white : PreggaColors.terracotta50,
                                borderRadius: isUser ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                                padding: "12px 16px",
                                boxShadow: isUser ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                                border: isUser ? `1px solid ${PreggaColors.secondary300}` : "none",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: isUser ? PreggaColors.sage700 : PreggaColors.terracotta700,
                                  marginBottom: 6,
                                }}
                              >
                                {senderName || (isUser ? "User" : "Doula")}
                              </div>
                              <p
                                style={{
                                  fontSize: 14,
                                  color: PreggaColors.neutral900,
                                  margin: 0,
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                }}
                              >
                                {msg.content}
                              </p>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: PreggaColors.neutral400,
                                  marginTop: 6,
                                  textAlign: "right",
                                }}
                              >
                                {formatMessageTime(msg.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Read-only Footer */}
        <div
          style={{
            padding: "12px 20px",
            background: PreggaColors.neutral50,
            borderTop: `1px solid ${PreggaColors.neutral100}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, color: PreggaColors.neutral500, margin: 0 }}>
            This is a read-only view of the conversation. Messages cannot be sent from the admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}
