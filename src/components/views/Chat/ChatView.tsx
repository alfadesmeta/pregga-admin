import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCountUp, useSupabasePaginatedQuery, useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { DataTable } from "../../ui/DataTable";
import { Select } from "../../ui/Select";
import { Modal } from "../../ui/Modal";
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
  Clock,
  Archive,
  User,
  Heart,
  X,
  AlertCircle,
  Play,
  Pause,
  ChevronDown,
  Loader2,
  Users,
  Settings,
} from "lucide-react";
import { DetailHeader, TabSelector, Tab } from "../../ui";

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
  const [filters, setFilters] = useState<ConversationFilters>({});

  const {
    data: conversations,
    count,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    setPage,
    refetch,
  } = useSupabasePaginatedQuery<ConversationWithUsers>(
    ['conversations', JSON.stringify(filters), searchQuery],
    (from, to) => fetchConversations(from, to, { ...filters, search: searchQuery || undefined }),
    { pageSize: 10 }
  );

  const activeCount = conversations.filter(c => c.is_active).length;
  const endedCount = conversations.filter(c => !c.is_active).length;

  const hasActiveFilters = searchQuery || filters.isActive !== undefined;

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const handleSelectConversation = (id: string) => {
    if (onNavigateToSubView) {
      onNavigateToSubView(id);
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  const handleViewMessages = (conversationId: string) => {
    if (onNavigateToSubView) {
      onNavigateToSubView(`messages-${conversationId}`);
    }
  };

  const parsed = parseSubView(subView);
  
  if (parsed?.type === 'messages') {
    return (
      <FullChatView
        conversationId={parsed.conversationId}
        onGoBack={handleGoBack}
        isMobile={isMobile}
      />
    );
  }

  if (parsed?.type === 'detail') {
    return (
      <ConversationDetailView
        conversationId={parsed.conversationId}
        onGoBack={handleGoBack}
        onRefresh={refetch}
        isMobile={isMobile}
        onViewMessages={handleViewMessages}
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

  const columns = [
    {
      key: "pregnant_user",
      label: "User",
      render: (_: unknown, conv: ConversationWithUsers) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: PreggaColors.sage100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.sage600,
              fontSize: 13,
              fontWeight: 600,
              overflow: "hidden",
            }}
          >
            {conv.pregnant_user?.avatar_url ? (
              <img src={conv.pregnant_user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (conv.pregnant_user?.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>
              {conv.pregnant_user?.display_name || "Unknown User"}
            </div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
              {conv.pregnant_user?.email || conv.pregnant_user?.phone || "No contact"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "doula",
      label: "Doula",
      render: (_: unknown, conv: ConversationWithUsers) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              fontSize: 12,
              fontWeight: 600,
              overflow: "hidden",
            }}
          >
            {conv.doula?.avatar_url ? (
              <img src={conv.doula.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (conv.doula?.display_name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2)
            )}
          </div>
          <span style={{ fontSize: 14, color: PreggaColors.neutral700 }}>
            {conv.doula?.display_name || "Unknown Doula"}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Started",
      render: (_: unknown, conv: ConversationWithUsers) => (
        <span style={{ fontSize: 14, color: PreggaColors.neutral500 }}>{formatTimeAgo(conv.created_at)}</span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (_: unknown, conv: ConversationWithUsers) => (
        <Badge variant={conv.is_active ? "sage" : "neutral"}>
          {conv.is_active ? "Active" : "Ended"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, conv: ConversationWithUsers) => (
        <Button variant="outline" size="sm" onClick={() => handleSelectConversation(conv.id)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <StatCard label="Total Chats" value={count} icon={<MessageCircle size={18} />} color={PreggaColors.sage500} delay={0} />
        <StatCard label="Active" value={activeCount} icon={<MessageCircle size={18} />} color={PreggaColors.success500} delay={100} />
        <StatCard label="Ended" value={endedCount} icon={<Archive size={18} />} color={PreggaColors.neutral400} delay={200} />
        <StatCard label="Avg Response" value="N/A" icon={<Clock size={18} />} color={PreggaColors.terracotta500} isHighlighted delay={300} />
      </div>

      {/* Filters */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
            showClear
            onClear={() => setSearchQuery("")}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Select
                value={filters.isActive === true ? "active" : filters.isActive === false ? "ended" : ""}
                onChange={(val) => setFilters({ ...filters, isActive: val === "active" ? true : val === "ended" ? false : undefined })}
                options={[
                  { value: "", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "ended", label: "Ended" },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 8, border: `1px solid ${PreggaColors.neutral200}`, background: PreggaColors.white, color: PreggaColors.neutral500, cursor: "pointer" }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 280 }}>
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
              showClear
              onClear={() => setSearchQuery("")}
            />
          </div>
          <div style={{ width: 130 }}>
            <Select
              value={filters.isActive === true ? "active" : filters.isActive === false ? "ended" : ""}
              onChange={(val) => setFilters({ ...filters, isActive: val === "active" ? true : val === "ended" ? false : undefined })}
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "ended", label: "Ended" },
              ]}
            />
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 42, padding: "0 14px", borderRadius: 8, border: `1px solid ${PreggaColors.neutral200}`, background: PreggaColors.white, color: PreggaColors.neutral700, fontSize: 14, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={conversations}
        currentPage={page}
        totalPages={totalPages}
        totalItems={count}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage="No conversations found"
        isMobile={isMobile}
        isLoading={isLoading}
        mobileCardRender={(conv: ConversationWithUsers) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} onClick={() => handleSelectConversation(conv.id)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontWeight: 600, fontSize: 14 }}>
                  {(conv.pregnant_user?.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>{conv.pregnant_user?.display_name || "Unknown"}</div>
                  <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>with {conv.doula?.display_name || "Unknown"}</div>
                </div>
              </div>
              <Badge variant={conv.is_active ? "sage" : "neutral"}>{conv.is_active ? "Active" : "Ended"}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: PreggaColors.neutral500 }}>
              <span>Started {formatTimeAgo(conv.created_at)}</span>
              {conv.ended_at && <span>Ended {formatTimeAgo(conv.ended_at)}</span>}
            </div>
          </div>
        )}
      />
    </div>
  );
}

function StatCard({ label, value, icon, color, isHighlighted = false, delay = 0 }: { label: string; value: string | number; icon: React.ReactNode; color: string; isHighlighted?: boolean; delay?: number }) {
  const isNumeric = typeof value === "number";
  const animatedValue = useCountUp(isNumeric ? value : 0, 1500, delay);

  return (
    <div style={{ background: PreggaColors.white, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: isHighlighted ? color : PreggaColors.neutral900 }}>
        {isNumeric ? animatedValue : value}
      </div>
    </div>
  );
}

function ConversationDetailView({
  conversationId,
  onGoBack,
  onRefresh,
  isMobile,
  onViewMessages,
}: {
  conversationId: string;
  onGoBack: () => void;
  onRefresh: () => void;
  isMobile: boolean;
  onViewMessages: (conversationId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"participants" | "channel" | "messages" | "actions">("participants");
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
        toast.success("Conversation ended (channel frozen)");
      } else {
        await reactivateConversation(conversation.id);
        toast.success("Conversation reactivated (channel unfrozen)");
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
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
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

  const tabs: Tab[] = [
    { id: "participants", label: "Participants", icon: <Users size={15} /> },
    { id: "channel", label: "Channel Info", icon: <Settings size={15} /> },
    { id: "messages", label: "Messages", icon: <MessageCircle size={15} /> },
    { id: "actions", label: "Admin Actions", icon: <Play size={15} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <DetailHeader
        title="Conversation Details"
        subtitle="View and manage this chat session"
        avatarFallback="Chat"
        avatarIcon={<MessageCircle size={24} />}
        avatarGradient={conversation.is_active 
          ? [PreggaColors.sage400, PreggaColors.sage500] 
          : [PreggaColors.neutral300, PreggaColors.neutral400]}
        onGoBack={onGoBack}
        stats={[
          { label: "Status", value: conversation.is_active ? "Active" : "Ended", highlight: conversation.is_active },
          { label: "Started", value: formatDate(conversation.created_at) },
          { label: conversation.ended_at ? "Ended" : "Channel ID", value: conversation.ended_at ? formatDate(conversation.ended_at) : conversation.stream_channel_id?.slice(0, 8) || "N/A" },
        ]}
        isMobile={isMobile}
        accentColor={conversation.is_active 
          ? `linear-gradient(90deg, ${PreggaColors.sage500} 0%, ${PreggaColors.sage400} 100%)`
          : `linear-gradient(90deg, ${PreggaColors.neutral400} 0%, ${PreggaColors.neutral300} 100%)`}
      />

      {/* Tabs */}
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
        isMobile={isMobile}
      />

      {/* Tab Content */}
      {activeTab === "participants" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <Card padding="20px">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: PreggaColors.sage100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.sage600, fontSize: 18, fontWeight: 600, overflow: "hidden" }}>
                {conversation.pregnant_user?.avatar_url ? (
                  <img src={conversation.pregnant_user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900 }}>
                    {conversation.pregnant_user?.display_name || "Unknown User"}
                  </span>
                  <Badge variant="sage">User</Badge>
                </div>
                <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                  {conversation.pregnant_user?.email || conversation.pregnant_user?.phone || "No contact"}
                </div>
              </div>
            </div>
          </Card>

          <Card padding="20px">
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: PreggaColors.terracotta100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.terracotta600, fontSize: 18, fontWeight: 600, overflow: "hidden" }}>
                {conversation.doula?.avatar_url ? (
                  <img src={conversation.doula.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Heart size={24} />
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900 }}>
                    {conversation.doula?.display_name || "Unknown Doula"}
                  </span>
                  <Badge variant="rose">Doula</Badge>
                </div>
                <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                  {conversation.doula?.email || conversation.doula?.phone || "No contact"}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "channel" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Stream Chat Channel
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <div style={{ padding: "12px 16px", background: PreggaColors.neutral50, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>Channel ID</div>
                <div style={{ fontSize: 14, fontWeight: 500, wordBreak: "break-all" }}>{conversation.stream_channel_id || "Not set"}</div>
              </div>
              <div style={{ padding: "12px 16px", background: PreggaColors.neutral50, borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>Channel Status</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{conversation.is_active ? "Unfrozen (Active)" : "Frozen (Ended)"}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "messages" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Chat Messages
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 16px", lineHeight: 1.5 }}>
              View the full message history for this conversation in a dedicated read-only chat interface.
            </p>
            <Button
              onClick={() => onViewMessages(conversationId)}
              icon={<MessageCircle size={16} />}
            >
              View Messages
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "actions" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Admin Actions
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 16px", lineHeight: 1.5 }}>
              {conversation.is_active
                ? "End this conversation to freeze the Stream Chat channel. Users will no longer be able to send messages."
                : "Reactivate this conversation to unfreeze the Stream Chat channel. Users will be able to resume messaging."
              }
            </p>
            <Button
              onClick={() => setShowActionModal(true)}
              icon={conversation.is_active ? <Pause size={16} /> : <Play size={16} />}
              style={{
                background: conversation.is_active ? PreggaColors.warning500 : PreggaColors.success500,
              }}
            >
              {conversation.is_active ? "End Conversation" : "Reactivate Conversation"}
            </Button>
          </div>
        </Card>
      )}

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
              ? "This will freeze the Stream Chat channel and prevent further messages."
              : "This will unfreeze the Stream Chat channel and allow messaging to resume."
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
