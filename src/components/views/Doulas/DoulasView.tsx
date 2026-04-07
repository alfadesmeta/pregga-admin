import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCountUp, useSupabasePaginatedQuery, useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { DataTable, TableColumn } from "../../ui/DataTable";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { StatusBadge, Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import {
  fetchDoulas,
  fetchDoulaById,
  fetchDoulaClients,
  fetchDoulaConversations,
  updateDoulaProfile,
  updateDoulaAvailability,
  verifyDoula,
  rejectDoula,
  type DoulaFilters,
} from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { DoulaWithProfile, UserWithProfile, ConversationWithUsers } from "../../../types/database";
import {
  Search,
  Users,
  Calendar,
  Award,
  X,
  AlertCircle,
  Pencil,
  Check,
  XCircle,
  MessageCircle,
  ToggleRight,
  Trash2,
  AlertTriangle,
  User,
} from "lucide-react";
import { DetailHeader, TabSelector, Tab } from "../../ui";

interface DoulasViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
  onNavigateToUserWithReturn?: (userId: string) => void;
  onNavigateToConversation?: (conversationId: string) => void;
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

export function DoulasView({ isMobile, subView, onNavigateToSubView, onGoBack, onNavigateToUserWithReturn, onNavigateToConversation }: DoulasViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DoulaFilters>({});

  const {
    data: doulas,
    count,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    setPage,
    refetch,
  } = useSupabasePaginatedQuery<DoulaWithProfile>(
    ['doulas', JSON.stringify(filters), searchQuery],
    (from, to) => fetchDoulas(from, to, { ...filters, search: searchQuery || undefined }),
    { pageSize: 10 }
  );

  if (subView) {
    return (
      <DoulaDetailView
        doulaId={subView}
        isMobile={isMobile}
        onGoBack={onGoBack}
        onViewClient={onNavigateToUserWithReturn}
        onNavigateToConversation={onNavigateToConversation}
        onRefresh={refetch}
      />
    );
  }

  const columns: TableColumn<DoulaWithProfile>[] = [
    {
      key: "display_name",
      label: "Doula",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            {row.avatar_url ? (
              <img src={row.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (row.display_name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2)
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
      key: "doula_profiles",
      label: "Bio",
      render: (_, row) => (
        <span style={{ color: PreggaColors.neutral500, fontSize: 13 }}>
          {row.doula_profiles?.bio?.slice(0, 50) || "No bio"}
          {row.doula_profiles?.bio && row.doula_profiles.bio.length > 50 ? "..." : ""}
        </span>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      render: (_, row) => (
        <Badge variant={row.doula_profiles?.is_available ? "success" : "neutral"} size="sm">
          {row.doula_profiles?.is_available ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
    {
      key: "verification",
      label: "Status",
      render: (_, row) => (
        <StatusBadge status={row.doula_profiles?.is_available ? "verified" : "pending"} />
      ),
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

  const renderMobileCard = (doula: DoulaWithProfile) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
              fontWeight: 600,
              fontSize: 14,
              overflow: "hidden",
            }}
          >
            {doula.avatar_url ? (
              <img src={doula.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              (doula.display_name || "D").split(" ").map((n) => n[0]).join("").slice(0, 2)
            )}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>
              {doula.display_name || "Unnamed"}
            </div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{doula.email || doula.phone}</div>
          </div>
        </div>
        <StatusBadge status={doula.doula_profiles?.is_available ? "verified" : "pending"} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <Badge variant={doula.doula_profiles?.is_available ? "success" : "neutral"} size="sm">
          {doula.doula_profiles?.is_available ? "Available" : "Unavailable"}
        </Badge>
        <span style={{ color: PreggaColors.neutral500 }}>Joined {formatTimeAgo(doula.created_at)}</span>
      </div>
    </div>
  );

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load doulas</h3>
        <p style={{ color: PreggaColors.neutral500 }}>{friendlyError(error)}</p>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  const verifiedCount = doulas.filter(d => d.doula_profiles?.is_available).length;
  const pendingCount = doulas.filter(d => !d.doula_profiles?.is_available).length;
  const availableCount = doulas.filter(d => d.doula_profiles?.is_available).length;

  return (
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
                value={filters.isVerified === true ? "verified" : filters.isVerified === false ? "pending" : ""}
                onChange={(v) => setFilters({ ...filters, isVerified: v === "verified" ? true : v === "pending" ? false : undefined })}
                options={[
                  { value: "", label: "All Status" },
                  { value: "verified", label: "Verified" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Select
                value={filters.isAvailable === true ? "yes" : filters.isAvailable === false ? "no" : ""}
                onChange={(v) => setFilters({ ...filters, isAvailable: v === "yes" ? true : v === "no" ? false : undefined })}
                options={[
                  { value: "", label: "Availability" },
                  { value: "yes", label: "Available" },
                  { value: "no", label: "Unavailable" },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 8, border: `1px solid ${PreggaColors.neutral200}`, background: PreggaColors.white, color: PreggaColors.neutral500, cursor: "pointer" }}>
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
          <div style={{ width: 130 }}>
            <Select
              value={filters.isVerified === true ? "verified" : filters.isVerified === false ? "pending" : ""}
              onChange={(v) => setFilters({ ...filters, isVerified: v === "verified" ? true : v === "pending" ? false : undefined })}
              options={[
                { value: "", label: "All Status" },
                { value: "verified", label: "Verified" },
                { value: "pending", label: "Pending" },
              ]}
            />
          </div>
          <div style={{ width: 150 }}>
            <Select
              value={filters.isAvailable === true ? "yes" : filters.isAvailable === false ? "no" : ""}
              onChange={(v) => setFilters({ ...filters, isAvailable: v === "yes" ? true : v === "no" ? false : undefined })}
              options={[
                { value: "", label: "All Availability" },
                { value: "yes", label: "Available" },
                { value: "no", label: "Unavailable" },
              ]}
            />
          </div>
          {hasActiveFilters && (
            <button onClick={clearAllFilters} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 42, padding: "0 14px", borderRadius: 8, border: `1px solid ${PreggaColors.neutral200}`, background: PreggaColors.white, color: PreggaColors.neutral700, fontSize: 14, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Total Doulas" value={count} icon={<Users size={18} />} color={PreggaColors.sage500} delay={0} />
        <StatCard label="Verified" value={verifiedCount} icon={<Award size={18} />} color={PreggaColors.success500} delay={100} />
        <StatCard label="Pending" value={pendingCount} icon={<Calendar size={18} />} color={PreggaColors.warning500} delay={200} />
        <StatCard label="Available" value={availableCount} icon={<Check size={18} />} color={PreggaColors.info500} delay={300} />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={doulas}
        currentPage={page}
        totalPages={totalPages}
        totalItems={count}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={(row) => onNavigateToSubView?.(row.id)}
        emptyMessage="No doulas found"
        isMobile={isMobile}
        mobileCardRender={renderMobileCard}
        isLoading={isLoading}
      />
    </div>
  );
}

function DoulaDetailView({
  doulaId,
  isMobile,
  onGoBack,
  onViewClient,
  onNavigateToConversation,
  onRefresh,
}: {
  doulaId: string;
  isMobile: boolean;
  onGoBack?: () => void;
  onViewClient?: (clientId: string) => void;
  onNavigateToConversation?: (conversationId: string) => void;
  onRefresh?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "availability" | "clients" | "conversations" | "verification" | "deactivate">("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [localAvailability, setLocalAvailability] = useState<boolean | null>(null);

  const { data: doula, isLoading, error, refetch } = useSupabaseQuery<DoulaWithProfile | null>(
    ['doula', doulaId],
    () => fetchDoulaById(doulaId)
  );

  const { data: clients } = useSupabaseQuery<UserWithProfile[]>(
    ['doula', doulaId, 'clients'],
    () => fetchDoulaClients(doulaId),
    { enabled: activeTab === 'clients' }
  );

  const { data: conversations } = useSupabaseQuery<ConversationWithUsers[]>(
    ['doula', doulaId, 'conversations'],
    () => fetchDoulaConversations(doulaId),
    { enabled: activeTab === 'conversations' }
  );

  // Use local state if set, otherwise use server data
  const isAvailable = localAvailability !== null ? localAvailability : (doula?.doula_profiles?.is_available ?? false);

  const handleToggleAvailability = async () => {
    if (!doula || isTogglingAvailability) return;
    const newAvailability = !isAvailable;
    
    // Optimistically update local state immediately
    setLocalAvailability(newAvailability);
    setIsTogglingAvailability(true);
    
    try {
      await updateDoulaAvailability(doula.id, newAvailability);
      toast.success(newAvailability ? "Doula marked as available" : "Doula marked as unavailable");
      // Silently refresh data in background so list stays in sync
      refetch();
      onRefresh?.();
    } catch (err) {
      // Revert on error
      setLocalAvailability(!newAvailability);
      toast.error(friendlyError(err));
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleDeactivate = async () => {
    if (!doula || deactivateConfirmText !== "DEACTIVATE") return;
    setIsDeactivating(true);
    try {
      await rejectDoula(doula.id);
      toast.success("Doula account deactivated");
      setShowDeactivateModal(false);
      setDeactivateConfirmText("");
      refetch();
      onRefresh?.();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleVerify = async () => {
    if (!doula) return;
    try {
      await verifyDoula(doula.id);
      toast.success("Doula verified successfully");
      refetch();
      onRefresh?.();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleReject = async () => {
    if (!doula) return;
    try {
      await rejectDoula(doula.id);
      toast.success("Doula verification rejected");
      refetch();
      onRefresh?.();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  if (error || !doula) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Doula not found</h3>
        <Button onClick={onGoBack} style={{ marginTop: 16 }}>Go Back</Button>
      </div>
    );
  }

  const tabs: Tab[] = [
    { id: "profile", label: "Profile", icon: <User size={15} /> },
    { id: "availability", label: "Availability", icon: <ToggleRight size={15} /> },
    { id: "clients", label: "Clients", icon: <Users size={15} /> },
    { id: "conversations", label: "Conversations", icon: <MessageCircle size={15} /> },
    ...(!isAvailable ? [{ id: "verification", label: "Verification", icon: <Award size={15} /> }] : []),
    { id: "deactivate", label: "Deactivate", icon: <Trash2 size={15} /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <DetailHeader
        title={doula.display_name || "Doula Profile"}
        subtitle={doula.email || doula.phone || "No contact info"}
        avatarUrl={doula.avatar_url}
        avatarFallback={doula.display_name || "Doula"}
        avatarGradient={isAvailable 
          ? [PreggaColors.sage400, PreggaColors.sage500] 
          : [PreggaColors.warning400, PreggaColors.warning500]}
        onGoBack={() => onGoBack?.()}
        action={<Button icon={<Pencil size={15} />} onClick={() => setShowEditModal(true)} size="sm">Edit</Button>}
        stats={[
          { label: "Verification", value: isAvailable ? "Verified" : "Pending", highlight: isAvailable },
          { label: "Availability", value: isAvailable ? "Available" : "Unavailable", highlight: isAvailable },
          { label: "Joined", value: formatDate(doula.created_at) },
        ]}
        isMobile={isMobile}
        accentColor={isAvailable 
          ? `linear-gradient(90deg, ${PreggaColors.sage500} 0%, ${PreggaColors.sage400} 100%)` 
          : `linear-gradient(90deg, ${PreggaColors.warning500} 0%, ${PreggaColors.warning400} 100%)`}
      />

      {/* Tabs */}
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
        isMobile={isMobile}
      />

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <InfoCard label="Name" value={doula.display_name || "—"} />
          <InfoCard label="Email" value={doula.email || "—"} />
          <InfoCard label="Phone" value={doula.phone || "—"} />
          <InfoCard label="Auth Provider" value={doula.auth_provider || "—"} />
          <InfoCard label="Created" value={formatDate(doula.created_at)} />
          <InfoCard label="Last Updated" value={formatDate(doula.updated_at)} />
          <Card padding="16px" style={{ gridColumn: isMobile ? "1" : "1 / -1" }}>
            <div style={{ fontSize: 13, color: PreggaColors.neutral500, marginBottom: 4 }}>Bio</div>
            <div style={{ fontSize: 14, color: PreggaColors.neutral900, lineHeight: 1.5 }}>
              {doula.doula_profiles?.bio || "No bio provided"}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "availability" && (
        <Card padding="24px">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 4px" }}>
                Availability Status
              </h3>
              <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: 0 }}>
                Control whether this doula appears as available for new clients
              </p>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={handleToggleAvailability}
              disabled={isTogglingAvailability}
              style={{
                position: "relative",
                width: 56,
                height: 30,
                borderRadius: 15,
                border: "none",
                outline: "none",
                background: isAvailable ? PreggaColors.sage500 : PreggaColors.neutral300,
                cursor: isTogglingAvailability ? "wait" : "pointer",
                transition: "background 0.2s ease",
                padding: 0,
                opacity: isTogglingAvailability ? 0.7 : 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: isAvailable ? 29 : 3,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: PreggaColors.white,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  transition: "left 0.2s ease",
                }}
              />
            </button>
          </div>
          
          {/* Status indicator */}
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 8, 
            padding: "8px 16px", 
            borderRadius: 20,
            background: isAvailable ? PreggaColors.sage50 : PreggaColors.neutral100,
            marginBottom: 20,
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isAvailable ? PreggaColors.sage500 : PreggaColors.neutral400,
            }} />
            <span style={{ 
              fontSize: 14, 
              fontWeight: 500, 
              color: isAvailable ? PreggaColors.sage700 : PreggaColors.neutral600
            }}>
              {isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          <div style={{ padding: "16px", background: PreggaColors.neutral50, borderRadius: 8 }}>
            <div style={{ fontSize: 13, color: PreggaColors.neutral500, marginBottom: 4 }}>Push Token</div>
            <div style={{ fontSize: 14, color: PreggaColors.neutral700, wordBreak: "break-all" }}>
              {doula.doula_profiles?.push_token || "No push token registered"}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "clients" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {clients && clients.length > 0 ? (
            clients.map((client) => (
              <div
                key={client.id}
                onClick={() => onViewClient?.(client.id)}
                style={{
                  background: PreggaColors.white,
                  borderRadius: 12,
                  padding: 16,
                  border: `1px solid ${PreggaColors.secondary300}`,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = PreggaColors.neutral50;
                  e.currentTarget.style.borderColor = PreggaColors.sage300;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = PreggaColors.white;
                  e.currentTarget.style.borderColor = PreggaColors.secondary300;
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontWeight: 600, fontSize: 14 }}>
                      {(client.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>{client.display_name || "Unnamed"}</div>
                      <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{client.email || client.phone}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onViewClient?.(client.id); }}>View</Button>
                </div>
              </div>
            ))
          ) : (
            <Card padding="40px">
              <div style={{ textAlign: "center", color: PreggaColors.neutral400 }}>
                <Users size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No clients assigned</div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "conversations" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <Card 
                key={conv.id} 
                padding="16px"
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
                onClick={() => onNavigateToConversation?.(conv.id)}
              >
                <div 
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  onMouseEnter={(e) => (e.currentTarget.parentElement as HTMLElement).style.background = PreggaColors.neutral50}
                  onMouseLeave={(e) => (e.currentTarget.parentElement as HTMLElement).style.background = PreggaColors.white}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: PreggaColors.sage100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.sage600 }}>
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>
                        Chat with {conv.pregnant_user?.display_name || "User"}
                      </div>
                      <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                        Started {conv.started_at ? formatTimeAgo(conv.started_at) : "Unknown"}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={conv.is_active ? "active" : "ended"} />
                </div>
              </Card>
            ))
          ) : (
            <Card padding="40px">
              <div style={{ textAlign: "center", color: PreggaColors.neutral400 }}>
                <MessageCircle size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No conversations</div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "verification" && !isAvailable && (
        <Card padding="24px">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: PreggaColors.warning50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Award size={24} color={PreggaColors.warning500} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>
                Verify This Doula
              </h3>
              <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 16px", lineHeight: 1.5 }}>
                Review the doula's profile and verify their credentials. Once verified, they will be visible to users seeking doula services.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <Button onClick={handleVerify} icon={<Check size={16} />}>
                  Verify Doula
                </Button>
                <Button variant="outline" onClick={handleReject} icon={<XCircle size={16} />} style={{ borderColor: PreggaColors.error300, color: PreggaColors.error600 }}>
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "deactivate" && (
        <Card padding="24px">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 20, background: PreggaColors.error50, borderRadius: 12, border: `1px solid ${PreggaColors.error100}` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: PreggaColors.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={22} color={PreggaColors.error500} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 6px" }}>
                Deactivate Doula Account
              </h3>
              <p style={{ fontSize: 13, color: PreggaColors.neutral600, margin: "0 0 16px", lineHeight: 1.5 }}>
                Deactivating this doula will remove their verification status and mark them as unavailable.
                They will no longer appear in search results for users. This action can be reversed by re-verifying the doula.
              </p>
              <button
                onClick={() => setShowDeactivateModal(true)}
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
                Deactivate Account
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Deactivate Modal with DELETE verification */}
      <Modal
        open={showDeactivateModal}
        onClose={() => { setShowDeactivateModal(false); setDeactivateConfirmText(""); }}
        title=""
        width={420}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => { setShowDeactivateModal(false); setDeactivateConfirmText(""); }}>Cancel</Button>
            <Button
              onClick={handleDeactivate}
              loading={isDeactivating}
              disabled={deactivateConfirmText !== "DEACTIVATE"}
              style={{
                background: PreggaColors.error500,
                opacity: deactivateConfirmText === "DEACTIVATE" ? 1 : 0.5,
                cursor: deactivateConfirmText === "DEACTIVATE" ? "pointer" : "not-allowed",
              }}
            >
              Deactivate Account
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: PreggaColors.error50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <AlertTriangle size={28} color={PreggaColors.error500} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>
            Deactivate Doula Account?
          </h3>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, lineHeight: 1.6, margin: "0 0 20px" }}>
            Are you sure you want to deactivate <strong style={{ color: PreggaColors.neutral700 }}>{doula.display_name || "this doula"}</strong>?
            They will be marked as unavailable and removed from search results.
          </p>
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 8 }}>
              Type <span style={{ fontFamily: "monospace", background: PreggaColors.neutral100, padding: "2px 6px", borderRadius: 4, color: PreggaColors.error600 }}>DEACTIVATE</span> to confirm
            </label>
            <input
              type="text"
              value={deactivateConfirmText}
              onChange={(e) => setDeactivateConfirmText(e.target.value.toUpperCase())}
              placeholder="DEACTIVATE"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 14,
                border: `1px solid ${deactivateConfirmText === "DEACTIVATE" ? PreggaColors.error400 : PreggaColors.neutral200}`,
                borderRadius: 8,
                outline: "none",
                fontFamily: "monospace",
                letterSpacing: "1px",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = PreggaColors.error400}
              onBlur={(e) => e.currentTarget.style.borderColor = deactivateConfirmText === "DEACTIVATE" ? PreggaColors.error400 : PreggaColors.neutral200}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <EditDoulaModal
        doula={doula}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (data) => {
          try {
            await updateDoulaProfile(doula.id, data.profile, data.doula);
            toast.success("Profile updated");
            refetch();
            setShowEditModal(false);
          } catch (err) {
            toast.error(friendlyError(err));
          }
        }}
      />
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="16px">
      <div style={{ fontSize: 13, color: PreggaColors.neutral500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900 }}>{value}</div>
    </Card>
  );
}

function StatCard({ label, value, icon, color, delay = 0 }: { label: string; value: number; icon: React.ReactNode; color: string; delay?: number }) {
  const animatedValue = useCountUp(value, 1500, delay);

  return (
    <div style={{ background: PreggaColors.white, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: PreggaColors.neutral900 }}>{animatedValue}</div>
    </div>
  );
}

function EditDoulaModal({
  doula,
  open,
  onClose,
  onSave,
}: {
  doula: DoulaWithProfile;
  open: boolean;
  onClose: () => void;
  onSave: (data: { profile: Partial<DoulaWithProfile>; doula?: Partial<DoulaWithProfile['doula_profiles']> }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    display_name: doula.display_name || "",
    email: doula.email || "",
    phone: doula.phone || "",
    bio: doula.doula_profiles?.bio || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        display_name: doula.display_name || "",
        email: doula.email || "",
        phone: doula.phone || "",
        bio: doula.doula_profiles?.bio || "",
      });
    }
  }, [open, doula]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        profile: {
          display_name: formData.display_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
        },
        doula: { bio: formData.bio || null },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Doula Profile"
      width={480}
      footer={
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      }
    >
      <Input label="Name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} />
      <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 6 }}>Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${PreggaColors.neutral200}`,
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            resize: "vertical",
          }}
        />
      </div>
    </Modal>
  );
}
