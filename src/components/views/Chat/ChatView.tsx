import { useState } from "react";
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
  endConversation,
  reactivateConversation,
  type ConversationFilters,
} from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { ConversationWithUsers } from "../../../types/database";
import {
  Search,
  MessageCircle,
  Clock,
  Archive,
  ArrowLeft,
  User,
  Heart,
  X,
  AlertCircle,
  Play,
  Pause,
} from "lucide-react";

interface ChatViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (subView: string) => void;
  onGoBack?: () => void;
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

  if (subView) {
    return (
      <ConversationDetailView
        conversationId={subView}
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onGoBack} style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral600, padding: 0, display: "flex" }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>Conversation Details</h1>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "4px 0 0" }}>View and manage this chat session</p>
        </div>
      </div>

      {/* Status Banner */}
      <div
        style={{
          background: conversation.is_active
            ? `linear-gradient(135deg, ${PreggaColors.sage500} 0%, ${PreggaColors.sage400} 100%)`
            : `linear-gradient(135deg, ${PreggaColors.neutral400} 0%, ${PreggaColors.neutral300} 100%)`,
          borderRadius: 16,
          padding: "24px 32px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Status</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.white }}>
            {conversation.is_active ? "Active" : "Ended"}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Started</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.white }}>
            {formatDate(conversation.created_at)}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>
            {conversation.ended_at ? "Ended" : "Stream Channel"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.white }}>
            {conversation.ended_at ? formatDate(conversation.ended_at) : conversation.stream_channel_id?.slice(0, 8) || "N/A"}
          </div>
        </div>
      </div>

      {/* Participants */}
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

      {/* Channel Info */}
      <Card padding="20px">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 16px" }}>
          Stream Chat Channel
        </h3>
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
      </Card>

      {/* Admin Actions */}
      <Card padding="20px">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 16px" }}>
          Admin Actions
        </h3>
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
      </Card>

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
