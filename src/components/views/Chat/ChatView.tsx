import { useState, useMemo } from "react";
import { useCountUp } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { DataTable } from "../../ui/DataTable";
import { Select } from "../../ui/Select";
import { Modal } from "../../ui/Modal";
import { usePagination } from "../../../hooks";
import { chatSessionsData } from "../../../data/mockData";
import type { ChatSession } from "../../../types";
import {
  Search,
  MessageCircle,
  Clock,
  Archive,
  ArrowLeft,
  User,
  Heart,
  Mail,
  Phone,
  Eye,
  X,
} from "lucide-react";

interface ChatViewProps {
  isMobile: boolean;
}

export function ChatView({ isMobile }: ChatViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  const filteredChats = useMemo(() => {
    return chatSessionsData.filter((chat) => {
      const matchesSearch =
        chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.doulaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || chat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredChats, { initialPageSize: 10 });

  const stats = {
    active: chatSessionsData.filter((c) => c.status === "active").length,
    flagged: chatSessionsData.filter((c) => c.status === "flagged").length,
    archived: chatSessionsData.filter((c) => c.status === "archived").length,
    total: chatSessionsData.length,
  };

  const hasActiveFilters = searchQuery || statusFilter;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  const handleViewTranscript = (chat: ChatSession) => {
    setSelectedChat(chat);
  };

  const handleArchiveChat = (chat: ChatSession) => {
    console.log("Archiving chat:", chat.id);
  };

  if (selectedChat) {
    return (
      <ChatTranscriptView
        chat={selectedChat}
        onGoBack={() => setSelectedChat(null)}
        onArchive={() => handleArchiveChat(selectedChat)}
        isMobile={isMobile}
      />
    );
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (_: unknown, chat: ChatSession) => (
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
            }}
          >
            {chat.userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>
              {chat.userName}
            </div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
              {chat.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "doula",
      label: "Doula",
      render: (_: unknown, chat: ChatSession) => (
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
            }}
          >
            {chat.doulaName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <span style={{ fontSize: 14, color: PreggaColors.neutral700 }}>{chat.doulaName}</span>
        </div>
      ),
    },
    {
      key: "messages",
      label: "Messages",
      render: (_: unknown, chat: ChatSession) => (
        <span style={{ fontSize: 14, color: PreggaColors.neutral700 }}>{chat.messageCount}</span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (_: unknown, chat: ChatSession) => (
        <span style={{ fontSize: 14, color: PreggaColors.neutral500 }}>{chat.avgResponseTime}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: unknown, chat: ChatSession) => {
        const variant =
          chat.status === "active"
            ? "sage"
            : chat.status === "archived"
            ? "neutral"
            : "warning";
        return (
          <Badge variant={variant}>
            {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, chat: ChatSession) => (
        <Button
          variant="outline"
          size="sm"
          icon={<Eye size={14} />}
          onClick={() => handleViewTranscript(chat)}
        >
          View Transcript
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: PreggaColors.neutral900,
            margin: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Chat Monitoring
        </h1>
        <p
          style={{
            fontSize: 14,
            color: PreggaColors.neutral500,
            margin: "4px 0 0",
          }}
        >
          Monitor and manage all chat sessions
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <StatCard
          label="Total Chats"
          value={stats.total}
          icon={<MessageCircle size={18} />}
          color={PreggaColors.sage500}
          delay={0}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<MessageCircle size={18} />}
          color={PreggaColors.sage500}
          delay={100}
        />
        <StatCard
          label="Archived"
          value={stats.archived}
          icon={<Archive size={18} />}
          color={PreggaColors.neutral400}
          delay={200}
        />
        <StatCard
          label="Avg Response"
          value="4.2 min"
          icon={<Clock size={18} />}
          color={PreggaColors.terracotta500}
          isHighlighted
          delay={300}
        />
      </div>

      {/* Filters Row */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: 12,
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
      >
        <div style={{ width: isMobile ? "100%" : 220 }}>
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>

        <div style={{ width: 130 }}>
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
              { value: "flagged", label: "Flagged" },
            ]}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              height: 42,
              padding: "0 14px",
              borderRadius: 8,
              border: `1px solid ${PreggaColors.neutral200}`,
              background: PreggaColors.white,
              color: PreggaColors.neutral700,
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Chat Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={goToPage}
        emptyMessage="No chat sessions found"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  isHighlighted = false,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isHighlighted?: boolean;
  delay?: number;
}) {
  const isNumeric = typeof value === "number";
  const animatedValue = useCountUp(isNumeric ? value : 0, 1500, delay);

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 12,
        padding: "16px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{label}</span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: isHighlighted ? color : PreggaColors.neutral900,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {isNumeric ? animatedValue : value}
      </div>
    </div>
  );
}

function ChatTranscriptView({
  chat,
  onGoBack,
  onArchive,
  isMobile,
}: {
  chat: ChatSession;
  onGoBack: () => void;
  onArchive: () => void;
  isMobile: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"messages" | "activity">("messages");
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  const handleArchive = () => {
    onArchive();
    setShowArchiveModal(false);
    onGoBack();
  };

  const mockMessages = [
    {
      id: "1",
      sender: "user",
      name: chat.userName,
      content: "I've been practicing the breathing exercises you recommended.",
      time: "10:30 AM",
    },
    {
      id: "2",
      sender: "doula",
      name: chat.doulaName,
      content:
        "That's wonderful to hear! How are you finding them? Are they helping with your relaxation?",
      time: "10:32 AM",
    },
    {
      id: "3",
      sender: "user",
      name: chat.userName,
      content:
        "Yes, they're really helping! I especially like the 4-7-8 technique. It helps me fall asleep faster.",
      time: "10:35 AM",
    },
    {
      id: "4",
      sender: "doula",
      name: chat.doulaName,
      content:
        "I'm so glad to hear that! The 4-7-8 technique is excellent for promoting relaxation. Keep practicing it daily for the best results.",
      time: "10:38 AM",
    },
    {
      id: "5",
      sender: "user",
      name: chat.userName,
      content: chat.lastMessage,
      time: "Now",
    },
  ];

  const statusVariant =
    chat.status === "active" ? "sage" : chat.status === "archived" ? "neutral" : "warning";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onGoBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: PreggaColors.neutral600,
            padding: 0,
            display: "flex",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: PreggaColors.neutral900,
              margin: 0,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Chat Transcript
          </h1>
          <p
            style={{
              fontSize: 14,
              color: PreggaColors.neutral500,
              margin: "4px 0 0",
            }}
          >
            Read-only view for admin monitoring
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card padding="20px">
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 20 : 0,
          }}
        >
          {/* User Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: PreggaColors.sage100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PreggaColors.sage600,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {chat.userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: PreggaColors.neutral900,
                  }}
                >
                  {chat.userName}
                </span>
                <Badge variant="sage">User</Badge>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 13,
                  color: PreggaColors.neutral500,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={14} />
                  {chat.userName.toLowerCase().replace(" ", ".")}@email.com
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={14} />
                  +1 (555) 123-4567
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: PreggaColors.neutral900,
                }}
              >
                {chat.messageCount}
              </div>
              <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>Messages</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: 4 }}>
                <Badge variant={statusVariant}>
                  {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                </Badge>
              </div>
              <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>Status</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: PreggaColors.neutral900,
                }}
              >
                {chat.lastMessageAt}
              </div>
              <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>Duration</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          background: PreggaColors.cream100,
          padding: 6,
          borderRadius: 10,
          width: "fit-content",
        }}
      >
        {(["messages", "activity"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: activeTab === tab ? PreggaColors.white : "transparent",
              color: activeTab === tab ? PreggaColors.neutral900 : PreggaColors.neutral500,
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {tab === "messages" ? "Messages" : "User Activity"}
          </button>
        ))}
      </div>

      {/* Messages Content */}
      {activeTab === "messages" && (
        <Card padding="24px">
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                    flexDirection: msg.sender === "user" ? "row" : "row-reverse",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        msg.sender === "user" ? PreggaColors.sage100 : PreggaColors.terracotta100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color:
                        msg.sender === "user" ? PreggaColors.sage600 : PreggaColors.terracotta600,
                    }}
                  >
                    {msg.sender === "user" ? <User size={14} /> : <Heart size={14} />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700 }}>
                    {msg.name}
                  </span>
                  <span style={{ fontSize: 12, color: PreggaColors.neutral400 }}>{msg.time}</span>
                </div>
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background:
                      msg.sender === "user" ? PreggaColors.cream100 : PreggaColors.sage100,
                    color: PreggaColors.neutral800,
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Activity Content */}
      {activeTab === "activity" && (
        <Card padding="24px">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: 16,
                background: PreggaColors.cream50,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: PreggaColors.sage500,
                }}
              />
              <div>
                <div style={{ fontSize: 14, color: PreggaColors.neutral700 }}>
                  Chat session started
                </div>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                  {chat.startedAt}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: PreggaColors.cream50,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: PreggaColors.terracotta500,
                }}
              />
              <div>
                <div style={{ fontSize: 14, color: PreggaColors.neutral700 }}>
                  Doula {chat.doulaName} joined
                </div>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                  {chat.startedAt}
                </div>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                background: PreggaColors.cream50,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: PreggaColors.neutral400,
                }}
              />
              <div>
                <div style={{ fontSize: 14, color: PreggaColors.neutral700 }}>
                  Last message sent
                </div>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                  {chat.lastMessageAt}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Archive Button */}
      {chat.status !== "archived" && (
        <div>
          <Button
            variant="sage"
            icon={<Archive size={16} />}
            onClick={() => setShowArchiveModal(true)}
          >
            Archive Chat
          </Button>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      <Modal
        open={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title=""
        width={400}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setShowArchiveModal(false)}>
              Cancel
            </Button>
            <Button variant="sage" icon={<Archive size={16} />} onClick={handleArchive}>
              Archive Chat
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: PreggaColors.sage100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Archive size={28} color={PreggaColors.sage600} />
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: PreggaColors.neutral900,
              margin: "0 0 8px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Archive this chat?
          </h3>
          <p
            style={{
              fontSize: 14,
              color: PreggaColors.neutral500,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            This will move the conversation between <strong style={{ color: PreggaColors.neutral700 }}>{chat.userName}</strong> and{" "}
            <strong style={{ color: PreggaColors.neutral700 }}>{chat.doulaName}</strong> to the archived section.
          </p>
        </div>
      </Modal>
    </div>
  );
}
