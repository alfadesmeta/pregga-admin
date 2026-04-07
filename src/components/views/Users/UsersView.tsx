import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PreggaColors } from "../../../theme/colors";
import { DataTable, TableColumn } from "../../ui/DataTable";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { StatusBadge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { useSupabasePaginatedQuery, useSupabaseQuery } from "../../../hooks";
import {
  fetchUsers,
  fetchUserById,
  fetchUserConversations,
  fetchUserBroadcasts,
  updateUserProfile,
  deleteUser,
  type UserFilters,
} from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { UserWithProfile, ConversationWithUsers, BroadcastRequest } from "../../../types/database";
import {
  Search,
  ArrowLeft,
  X,
  Trash2,
  AlertTriangle,
  Pencil,
  Calendar,
  MessageCircle,
  Radio,
  User,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { TabSelector, Tab } from "../../ui";

interface UsersViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
  onNavigateToConversation?: (conversationId: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function calculatePregnancyWeek(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const weeksUntilDue = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  const currentWeek = 40 - weeksUntilDue;
  return currentWeek > 0 && currentWeek <= 42 ? currentWeek : null;
}

function Shimmer({ width = "100%", height = 20, borderRadius = 6 }: { width?: string | number; height?: string | number; borderRadius?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export function UsersView({ isMobile, subView, onNavigateToSubView, onGoBack, onNavigateToConversation }: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});

  const {
    data: users,
    count,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    setPage,
    refetch,
  } = useSupabasePaginatedQuery<UserWithProfile>(
    ['users', JSON.stringify(filters), searchQuery],
    (from, to) => fetchUsers(from, to, { ...filters, search: searchQuery || undefined }),
    { pageSize: 10 }
  );

  if (subView) {
    return (
      <UserDetailView
        userId={subView}
        isMobile={isMobile}
        onGoBack={onGoBack}
        onRefresh={refetch}
        onNavigateToConversation={onNavigateToConversation}
      />
    );
  }

  const columns: TableColumn<UserWithProfile>[] = [
    {
      key: "display_name",
      label: "User",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: PreggaColors.primary100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.primary500,
              fontSize: 13,
              fontWeight: 600,
              overflow: "hidden",
            }}
          >
            {row.avatar_url ? (
              <img src={row.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (row.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: PreggaColors.neutral900 }}>{row.display_name || "Unnamed"}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{row.email || row.phone || "No contact"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "pregnant_profiles",
      label: "Pregnancy",
      render: (_, row) => {
        const week = calculatePregnancyWeek(row.pregnant_profiles?.due_date || null);
        return week ? (
          <div>
            <div style={{ fontWeight: 500 }}>Week {week}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
              Due: {formatDate(row.pregnant_profiles!.due_date!)}
            </div>
          </div>
        ) : (
          <span style={{ color: PreggaColors.neutral400 }}>—</span>
        );
      },
    },
    {
      key: "subscriptions",
      label: "Subscription",
      render: (_, row) => {
        const activeSub = row.subscriptions?.find(s => s.status === 'active');
        return activeSub ? (
          <div>
            <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{activeSub.plan.replace('_', ' ')}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{activeSub.status}</div>
          </div>
        ) : (
          <span style={{ color: PreggaColors.neutral400 }}>No subscription</span>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      render: (_, row) => (
        <span style={{ color: PreggaColors.neutral500, fontSize: 13 }}>{formatTimeAgo(row.created_at)}</span>
      ),
    },
  ];

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined) || searchQuery !== "";

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const renderMobileCard = (user: UserWithProfile) => {
    const week = calculatePregnancyWeek(user.pregnant_profiles?.due_date || null);
    const activeSub = user.subscriptions?.find(s => s.status === 'active');
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: PreggaColors.primary100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PreggaColors.primary600,
                fontWeight: 600,
                fontSize: 14,
                overflow: "hidden",
              }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                (user.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)
              )}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>
                {user.display_name || "Unnamed"}
              </div>
              <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{user.email || user.phone}</div>
            </div>
          </div>
          {activeSub && <StatusBadge status="active" />}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: PreggaColors.neutral500 }}>{week ? `Week ${week}` : "No pregnancy data"}</span>
          <span style={{ color: PreggaColors.neutral500 }}>
            {user.pregnant_profiles?.due_date ? `Due: ${formatDate(user.pregnant_profiles.due_date)}` : ""}
          </span>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load users</h3>
        <p style={{ color: PreggaColors.neutral500 }}>{friendlyError(error)}</p>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Filters */}
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={16} />}
                  showClear
                  onClear={() => setSearchQuery("")}
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Select
                  value={filters.hasSubscription === true ? "yes" : filters.hasSubscription === false ? "no" : ""}
                  onChange={(v) => setFilters({ ...filters, hasSubscription: v === "yes" ? true : v === "no" ? false : undefined })}
                  options={[
                    { value: "", label: "All" },
                    { value: "yes", label: "Subscribed" },
                    { value: "no", label: "Free" },
                  ]}
                />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    borderRadius: 8,
                    border: `1px solid ${PreggaColors.neutral200}`,
                    background: PreggaColors.white,
                    color: PreggaColors.neutral500,
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 280 }}>
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} />}
                showClear
                onClear={() => setSearchQuery("")}
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ width: 150 }}>
              <Select
                value={filters.hasSubscription === true ? "yes" : filters.hasSubscription === false ? "no" : ""}
                onChange={(v) => setFilters({ ...filters, hasSubscription: v === "yes" ? true : v === "no" ? false : undefined })}
                options={[
                  { value: "", label: "All Users" },
                  { value: "yes", label: "Subscribed" },
                  { value: "no", label: "Free" },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
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
                }}
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users}
          currentPage={page}
          totalPages={totalPages}
          totalItems={count}
          pageSize={pageSize}
          onPageChange={setPage}
          onRowClick={(row) => onNavigateToSubView?.(row.id)}
          emptyMessage="No users found"
          isMobile={isMobile}
          mobileCardRender={renderMobileCard}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

function UserDetailView({
  userId,
  isMobile,
  onGoBack,
  onRefresh,
  onNavigateToConversation,
}: {
  userId: string;
  isMobile: boolean;
  onGoBack?: () => void;
  onRefresh?: () => void;
  onNavigateToConversation?: (conversationId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "pregnancy" | "subscription" | "conversations" | "broadcasts" | "delete">("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { data: user, isLoading, error, refetch } = useSupabaseQuery<UserWithProfile | null>(
    ['user', userId],
    () => fetchUserById(userId)
  );

  const { data: conversations } = useSupabaseQuery<ConversationWithUsers[]>(
    ['user', userId, 'conversations'],
    () => fetchUserConversations(userId),
    { enabled: activeTab === 'conversations' }
  );

  const { data: broadcasts } = useSupabaseQuery<BroadcastRequest[]>(
    ['user', userId, 'broadcasts'],
    () => fetchUserBroadcasts(userId),
    { enabled: activeTab === 'broadcasts' }
  );

  const handleDeleteUser = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success("User deletion request submitted");
      setShowDeleteModal(false);
      onRefresh?.();
      onGoBack?.();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Shimmer width={32} height={32} borderRadius={8} />
          <div style={{ flex: 1 }}>
            <Shimmer width={180} height={24} />
            <div style={{ marginTop: 6 }}><Shimmer width={140} height={14} /></div>
          </div>
        </div>
        <Shimmer width="100%" height={140} borderRadius={16} />
        <Shimmer width="100%" height={48} borderRadius={12} />
        <Shimmer width="100%" height={280} borderRadius={16} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>User not found</h3>
        <Button onClick={onGoBack} style={{ marginTop: 16 }}>Go Back</Button>
      </div>
    );
  }

  const pregnancyWeek = calculatePregnancyWeek(user.pregnant_profiles?.due_date || null);
  const activeSub = user.subscriptions?.find(s => s.status === 'active');
  const initials = (user.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "pregnancy", label: "Pregnancy", icon: <Calendar size={15} /> },
    { id: "subscription", label: "Subscription", icon: <CreditCard size={15} /> },
    { id: "conversations", label: "Conversations", icon: <MessageCircle size={15} /> },
    { id: "broadcasts", label: "Broadcasts", icon: <Radio size={15} /> },
    { id: "delete", label: "Delete", icon: <Trash2 size={15} /> },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Card */}
      <Card padding="0" style={{ overflow: "hidden" }}>
        {/* Top gradient accent */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${PreggaColors.sage500} 0%, ${PreggaColors.sage400} 100%)` }} />
        
        <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            {/* User info section */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={onGoBack}
                style={{
                  background: PreggaColors.neutral100,
                  border: "none",
                  cursor: "pointer",
                  color: PreggaColors.neutral600,
                  padding: 8,
                  borderRadius: 8,
                  display: "flex",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = PreggaColors.neutral200}
                onMouseLeave={(e) => e.currentTarget.style.background = PreggaColors.neutral100}
              >
                <ArrowLeft size={18} />
              </button>
              
              {/* Avatar */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${PreggaColors.sage400} 0%, ${PreggaColors.sage500} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PreggaColors.white,
                  fontSize: 18,
                  fontWeight: 600,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : initials}
              </div>
              
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: PreggaColors.neutral900, margin: 0, lineHeight: 1.3 }}>
                  {user.display_name || "Unnamed User"}
                </h1>
                <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "4px 0 0 0" }}>
                  {user.email || user.phone || "No contact info"}
                </p>
              </div>
            </div>
            
            {/* Edit button */}
            <Button icon={<Pencil size={15} />} onClick={() => setShowEditModal(true)} size="sm">
              Edit
            </Button>
          </div>
          
          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? 12 : 0,
              marginTop: 24,
              padding: isMobile ? 0 : "0 8px",
            }}
          >
            <StatItem
              label="Pregnancy Week"
              value={pregnancyWeek ? `Week ${pregnancyWeek}` : "Not set"}
              highlight={!!pregnancyWeek}
              isMobile={isMobile}
            />
            <StatItem
              label="Subscription"
              value={activeSub?.plan?.replace('_', ' ') || "Free"}
              highlight={!!activeSub}
              isMobile={isMobile}
              center={!isMobile}
            />
            <StatItem
              label="Member Since"
              value={formatDate(user.created_at)}
              isMobile={isMobile}
              right={!isMobile}
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <TabSelector
        tabs={tabs as unknown as Tab[]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
        isMobile={isMobile}
      />

      {/* Tab Content */}
      {activeTab === "profile" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Profile Information
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
              <DetailRow label="Full Name" value={user.display_name || "—"} />
              <DetailRow label="Email Address" value={user.email || "—"} />
              <DetailRow label="Phone Number" value={user.phone || "—"} />
              <DetailRow label="Auth Provider" value={user.auth_provider || "email"} />
              <DetailRow label="Account Created" value={formatDate(user.created_at)} />
              <DetailRow label="Last Updated" value={formatDate(user.updated_at)} />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "pregnancy" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Pregnancy Details
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
              <DetailRow label="Due Date" value={user.pregnant_profiles?.due_date ? formatDate(user.pregnant_profiles.due_date) : "Not set"} />
              <DetailRow label="Current Week" value={pregnancyWeek ? `Week ${pregnancyWeek}` : "—"} />
              <DetailRow label="Trimester" value={pregnancyWeek ? (pregnancyWeek <= 13 ? "First Trimester" : pregnancyWeek <= 26 ? "Second Trimester" : "Third Trimester") : "—"} />
              <DetailRow label="Onboarding Status" value={user.pregnant_profiles?.onboarding_complete ? "Completed" : "In Progress"} />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "subscription" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card padding="0">
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
                Current Subscription
              </h3>
            </div>
            {activeSub ? (
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 6, textTransform: "uppercase", fontWeight: 500, letterSpacing: "0.5px" }}>Plan</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: PreggaColors.sage600, textTransform: "capitalize" }}>
                      {activeSub.plan?.replace('_', ' ') || "Premium"}
                    </div>
                  </div>
                  <StatusBadge status={activeSub.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 16, background: PreggaColors.neutral50, borderRadius: 10 }}>
                    <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 4 }}>Start Date</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>{formatDate(activeSub.starts_at)}</div>
                  </div>
                  <div style={{ padding: 16, background: PreggaColors.neutral50, borderRadius: 10 }}>
                    <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 4 }}>Renewal Date</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>{activeSub.ends_at ? formatDate(activeSub.ends_at) : "Auto-renewing"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: PreggaColors.neutral100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <CreditCard size={24} color={PreggaColors.neutral400} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: PreggaColors.neutral600 }}>No active subscription</div>
                <div style={{ fontSize: 13, color: PreggaColors.neutral400, marginTop: 4 }}>User is on the free plan</div>
              </div>
            )}
          </Card>

          {user.subscriptions && user.subscriptions.length > 1 && (
            <Card padding="0">
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
                  Subscription History
                </h3>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {user.subscriptions.filter(s => s.id !== activeSub?.id).map((sub) => (
                    <div key={sub.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: PreggaColors.neutral50, borderRadius: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500, textTransform: "capitalize", fontSize: 14 }}>{sub.plan?.replace('_', ' ')}</div>
                        <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginTop: 2 }}>
                          {formatDate(sub.starts_at)} — {sub.ends_at ? formatDate(sub.ends_at) : "Ongoing"}
                        </div>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "conversations" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Conversation History
            </h3>
          </div>
          {conversations && conversations.length > 0 ? (
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => onNavigateToConversation?.(conv.id)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 16,
                      background: PreggaColors.neutral50,
                      borderRadius: 10,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = PreggaColors.neutral100}
                    onMouseLeave={(e) => e.currentTarget.style.background = PreggaColors.neutral50}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: PreggaColors.sage100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.sage600 }}>
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>Chat with {conv.doula?.display_name || "Doula"}</div>
                        <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginTop: 2 }}>
                          Started {formatTimeAgo(conv.created_at)}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={conv.is_active ? "active" : "ended"} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: PreggaColors.neutral100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <MessageCircle size={24} color={PreggaColors.neutral400} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: PreggaColors.neutral600 }}>No conversations yet</div>
              <div style={{ fontSize: 13, color: PreggaColors.neutral400, marginTop: 4 }}>User hasn't started any chats</div>
            </div>
          )}
        </Card>
      )}

      {activeTab === "broadcasts" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Broadcast Requests
            </h3>
          </div>
          {broadcasts && broadcasts.length > 0 ? (
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {broadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: 16,
                      background: PreggaColors.neutral50,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 14, lineHeight: 1.4 }}>
                        {broadcast.initial_message?.slice(0, 80) || "No message"}
                        {broadcast.initial_message && broadcast.initial_message.length > 80 ? "..." : ""}
                      </div>
                      <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                        {formatTimeAgo(broadcast.created_at)} • {broadcast.notified_doulas?.length || 0} doulas notified
                      </div>
                    </div>
                    <StatusBadge status={broadcast.status} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: PreggaColors.neutral100, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Radio size={24} color={PreggaColors.neutral400} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: PreggaColors.neutral600 }}>No broadcast requests</div>
              <div style={{ fontSize: 13, color: PreggaColors.neutral400, marginTop: 4 }}>User hasn't sent any broadcasts</div>
            </div>
          )}
        </Card>
      )}

      {activeTab === "delete" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.error600 }}>
              Danger Zone
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 20, background: PreggaColors.error50, borderRadius: 12, border: `1px solid ${PreggaColors.error100}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: PreggaColors.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={22} color={PreggaColors.error500} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 6px" }}>
                  Delete User Account
                </h4>
                <p style={{ fontSize: 13, color: PreggaColors.neutral600, margin: "0 0 16px", lineHeight: 1.5 }}>
                  This will create a deletion request for this user. All associated data including pregnancy info, conversations, and subscription history will be scheduled for permanent removal. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 8,
                    border: `1px solid ${PreggaColors.error400}`,
                    color: PreggaColors.error600,
                    background: PreggaColors.white,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = PreggaColors.error50;
                    e.currentTarget.style.borderColor = PreggaColors.error500;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = PreggaColors.white;
                    e.currentTarget.style.borderColor = PreggaColors.error400;
                  }}
                >
                  <Trash2 size={14} />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <EditUserModal
        user={user}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (data) => {
          try {
            await updateUserProfile(user.id, data.profile, data.pregnant);
            toast.success("Profile updated");
            refetch();
            setShowEditModal(false);
          } catch (err) {
            toast.error(friendlyError(err));
          }
        }}
      />

      {/* Delete Modal with DELETE verification */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
        title=""
        width={420}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}>Cancel</Button>
            <Button
              onClick={handleDeleteUser}
              loading={isDeleting}
              disabled={deleteConfirmText !== "DELETE"}
              style={{ 
                background: deleteConfirmText === "DELETE" ? PreggaColors.error500 : PreggaColors.neutral300,
                cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed",
              }}
            >
              Delete User
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: PreggaColors.error50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={28} color={PreggaColors.error500} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>
            Delete User Account?
          </h3>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, lineHeight: 1.6, margin: "0 0 20px" }}>
            Are you sure you want to delete <strong style={{ color: PreggaColors.neutral700 }}>{user.display_name || "this user"}</strong>?
            This will create a deletion request and schedule the account for permanent removal.
          </p>
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 8 }}>
              Type <span style={{ fontFamily: "monospace", background: PreggaColors.neutral100, padding: "2px 6px", borderRadius: 4, color: PreggaColors.error600 }}>DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 14,
                border: `1px solid ${deleteConfirmText === "DELETE" ? PreggaColors.error400 : PreggaColors.neutral200}`,
                borderRadius: 8,
                outline: "none",
                fontFamily: "monospace",
                letterSpacing: "1px",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = PreggaColors.error400}
              onBlur={(e) => e.currentTarget.style.borderColor = deleteConfirmText === "DELETE" ? PreggaColors.error400 : PreggaColors.neutral200}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatItem({ label, value, highlight, isMobile, center, right }: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  isMobile?: boolean;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <div style={{ 
      textAlign: isMobile ? "left" : center ? "center" : right ? "right" : "left",
      padding: isMobile ? "12px 16px" : 0,
      background: isMobile ? PreggaColors.neutral50 : "transparent",
      borderRadius: isMobile ? 10 : 0,
    }}>
      <div style={{ 
        fontSize: 12, 
        fontWeight: 500, 
        color: PreggaColors.neutral500, 
        textTransform: "uppercase", 
        letterSpacing: "0.5px", 
        marginBottom: 4 
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: isMobile ? 16 : 18, 
        fontWeight: 600, 
        color: highlight ? PreggaColors.sage600 : PreggaColors.neutral900,
        textTransform: label === "Subscription" ? "capitalize" : "none",
      }}>
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: PreggaColors.neutral500, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: PreggaColors.neutral900 }}>
        {value}
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  open,
  onClose,
  onSave,
}: {
  user: UserWithProfile;
  open: boolean;
  onClose: () => void;
  onSave: (data: { profile: Partial<UserWithProfile>; pregnant?: Partial<UserWithProfile['pregnant_profiles']> }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    display_name: user.display_name || "",
    email: user.email || "",
    phone: user.phone || "",
    due_date: user.pregnant_profiles?.due_date || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        display_name: user.display_name || "",
        email: user.email || "",
        phone: user.phone || "",
        due_date: user.pregnant_profiles?.due_date || "",
      });
    }
  }, [open, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        profile: {
          display_name: formData.display_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
        },
        pregnant: formData.due_date ? { due_date: formData.due_date } : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit User Profile"
      width={480}
      footer={
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      }
    >
      <Input
        label="Name"
        value={formData.display_name}
        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <Input
        label="Due Date"
        type="date"
        value={formData.due_date}
        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
      />
    </Modal>
  );
}
