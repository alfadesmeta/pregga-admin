import React, { useState, useMemo } from "react";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { chatSessionsData } from "../../../data/mockData";
import type { ChatSession } from "../../../types";
import {
  Search,
  MessageCircle,
  Clock,
  AlertTriangle,
  Archive,
  User,
  Heart,
  ChevronRight,
} from "lucide-react";

interface ChatViewProps {
  isMobile: boolean;
}

export function ChatView({ isMobile }: ChatViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "flagged" | "archived">("active");
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);

  const filteredChats = useMemo(() => {
    return chatSessionsData.filter((chat) => {
      const matchesSearch =
        chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.doulaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = chat.status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const stats = {
    active: chatSessionsData.filter((c) => c.status === "active").length,
    flagged: chatSessionsData.filter((c) => c.status === "flagged").length,
    archived: chatSessionsData.filter((c) => c.status === "archived").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <StatCard
          label="Active Chats"
          value={stats.active}
          icon={<MessageCircle size={18} />}
          color={PreggaColors.sage500}
        />
        <StatCard
          label="Flagged"
          value={stats.flagged}
          icon={<AlertTriangle size={18} />}
          color={PreggaColors.warning500}
        />
        <StatCard
          label="Archived"
          value={stats.archived}
          icon={<Archive size={18} />}
          color={PreggaColors.neutral400}
        />
        <StatCard
          label="Avg Response"
          value="4.5 min"
          icon={<Clock size={18} />}
          color={PreggaColors.primary500}
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : selectedChat ? "350px 1fr" : "1fr",
          gap: 20,
          minHeight: 600,
        }}
      >
        {/* Chat List */}
        <Card padding="0">
          {/* Search & Tabs */}
          <div style={{ padding: 16, borderBottom: `1px solid ${PreggaColors.primary100}` }}>
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              {(["active", "flagged", "archived"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: activeTab === tab ? PreggaColors.primary500 : PreggaColors.primary50,
                    color: activeTab === tab ? PreggaColors.white : PreggaColors.neutral600,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {tab === "active" && <MessageCircle size={14} />}
                  {tab === "flagged" && <AlertTriangle size={14} />}
                  {tab === "archived" && <Archive size={14} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: 10,
                      background: activeTab === tab ? "rgba(255,255,255,0.2)" : PreggaColors.primary100,
                      fontSize: 11,
                    }}
                  >
                    {stats[tab]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat List */}
          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {filteredChats.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: PreggaColors.neutral500 }}>
                No conversations found
              </div>
            ) : (
              filteredChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => setSelectedChat(chat)}
                />
              ))
            )}
          </div>
        </Card>

        {/* Chat Detail */}
        {selectedChat && !isMobile && (
          <ChatDetail chat={selectedChat} onClose={() => setSelectedChat(null)} />
        )}
      </div>

      {/* Mobile Chat Detail Modal */}
      {selectedChat && isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: PreggaColors.white,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatDetail chat={selectedChat} onClose={() => setSelectedChat(null)} isMobile />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${PreggaColors.primary100}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: PreggaColors.neutral900, marginTop: 8 }}>
        {value}
      </div>
    </div>
  );
}

function ChatListItem({
  chat,
  isSelected,
  onClick,
}: {
  chat: ChatSession;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 16px",
        borderBottom: `1px solid ${PreggaColors.primary100}`,
        cursor: "pointer",
        background: isSelected ? PreggaColors.primary50 : "transparent",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = PreggaColors.cream50;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: PreggaColors.sage100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PreggaColors.sage600,
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {chat.userName.split(" ").map((n) => n[0]).join("")}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>
              {chat.userName}
            </span>
            <span style={{ fontSize: 11, color: PreggaColors.neutral400 }}>{chat.lastMessageAt}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Heart size={12} style={{ color: PreggaColors.rose500 }} />
            <span style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{chat.doulaName}</span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: PreggaColors.neutral600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {chat.lastMessage}
          </div>
        </div>
        {chat.status === "flagged" && (
          <AlertTriangle size={16} style={{ color: PreggaColors.warning500, flexShrink: 0 }} />
        )}
      </div>
    </div>
  );
}

function ChatDetail({
  chat,
  onClose,
  isMobile = false,
}: {
  chat: ChatSession;
  onClose: () => void;
  isMobile?: boolean;
}) {
  const mockMessages = [
    { id: "1", sender: "user", name: chat.userName, content: "Hi! I have a question about my breathing exercises.", time: "10:30 AM" },
    { id: "2", sender: "doula", name: chat.doulaName, content: "Of course! I'm happy to help. What would you like to know?", time: "10:32 AM" },
    { id: "3", sender: "user", name: chat.userName, content: "I've been practicing the 4-7-8 technique but I'm not sure if I'm doing it correctly.", time: "10:35 AM" },
    { id: "4", sender: "doula", name: chat.doulaName, content: "That's a great technique! Let me walk you through it step by step. First, exhale completely through your mouth...", time: "10:38 AM" },
    { id: "5", sender: "user", name: chat.userName, content: chat.lastMessage, time: "Now" },
  ];

  return (
    <Card padding="0" style={{ display: "flex", flexDirection: "column", height: isMobile ? "100%" : 600 }}>
      {/* Header */}
      <div
        style={{
          padding: 16,
          borderBottom: `1px solid ${PreggaColors.primary100}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                color: PreggaColors.neutral600,
              }}
            >
              <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} />
            </button>
          )}
          <div>
            <div style={{ fontWeight: 600, color: PreggaColors.neutral900 }}>{chat.userName}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
              with {chat.doulaName} • {chat.messageCount} messages
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {chat.status === "flagged" && <Badge variant="warning">Flagged</Badge>}
          <Badge variant="sage">{chat.avgResponseTime} avg</Badge>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
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
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: msg.sender === "user" ? PreggaColors.sage100 : PreggaColors.rose100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: msg.sender === "user" ? PreggaColors.sage600 : PreggaColors.rose600,
                }}
              >
                {msg.sender === "user" ? <User size={12} /> : <Heart size={12} />}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: PreggaColors.neutral700 }}>{msg.name}</span>
              <span style={{ fontSize: 11, color: PreggaColors.neutral400 }}>{msg.time}</span>
            </div>
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: 12,
                background: msg.sender === "user" ? PreggaColors.cream100 : PreggaColors.primary50,
                color: PreggaColors.neutral800,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${PreggaColors.primary100}`,
          background: PreggaColors.cream50,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="outline" size="sm">
            Archive Chat
          </Button>
          {chat.status === "flagged" ? (
            <Button variant="sage" size="sm">
              Resolve Flag
            </Button>
          ) : (
            <Button variant="outline" size="sm" icon={<AlertTriangle size={14} />}>
              Flag Chat
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
