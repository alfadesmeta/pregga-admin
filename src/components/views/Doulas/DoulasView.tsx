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
  ArrowLeft,
  Award,
  X,
  AlertCircle,
  Pencil,
  Check,
  XCircle,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle,
  User,
} from "lucide-react";

interface DoulasViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
  onNavigateToUserWithReturn?: (userId: string) => void;
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

export function DoulasView({ isMobile, subView, onNavigateToSubView, onGoBack, onNavigateToUserWithReturn }: DoulasViewProps) {
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
  onRefresh,
}: {
  doulaId: string;
  isMobile: boolean;
  onGoBack?: () => void;
  onViewClient?: (clientId: string) => void;
  onRefresh?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "availability" | "clients" | "conversations" | "verification" | "deactivate">("profile");
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleToggleAvailability = async () => {
    if (!doula) return;
    try {
      await updateDoulaAvailability(doula.id, !doula.doula_profiles?.is_available);
      toast.success(doula.doula_profiles?.is_available ? "Doula marked as unavailable" : "Doula marked as available");
      refetch();
    } catch (err) {
      toast.error(friendlyError(err));
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

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={14} /> },
    { id: "availability", label: "Availability", icon: <ToggleRight size={14} /> },
    { id: "clients", label: "Clients", icon: <Users size={14} /> },
    { id: "conversations", label: "Conversations", icon: <MessageCircle size={14} /> },
    ...(!doula.doula_profiles?.is_available ? [{ id: "verification" as const, label: "Verification", icon: <Award size={14} /> }] : []),
    { id: "deactivate", label: "Deactivate", icon: <Trash2 size={14} /> },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onGoBack} style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral600, padding: 0, display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>
              {doula.display_name || "Doula Profile"}
            </h1>
            <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: 0 }}>
              {doula.email || doula.phone || "No contact info"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button icon={<Pencil size={16} />} onClick={() => setShowEditModal(true)}>Edit</Button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        style={{
          background: doula.doula_profiles?.is_available
            ? `linear-gradient(135deg, ${PreggaColors.sage500} 0%, ${PreggaColors.sage400} 100%)`
            : `linear-gradient(135deg, ${PreggaColors.warning500} 0%, ${PreggaColors.warning400} 100%)`,
          borderRadius: 16,
          padding: "24px 32px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Verification</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.white }}>
            {doula.doula_profiles?.is_available ? "Verified" : "Pending"}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "center" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Availability</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.white }}>
            {doula.doula_profiles?.is_available ? "Available" : "Unavailable"}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 4 }}>Joined</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: PreggaColors.white }}>
            {formatDate(doula.created_at)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: PreggaColors.white, borderRadius: 12, padding: 4, border: `1px solid ${PreggaColors.secondary300}`, overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: isMobile ? "0 0 auto" : 1,
              padding: isMobile ? "10px 16px" : "12px 20px",
              borderRadius: 8,
              border: activeTab === tab.id ? `1px solid ${PreggaColors.secondary300}` : "1px solid transparent",
              background: activeTab === tab.id ? PreggaColors.secondary100 : "transparent",
              color: activeTab === tab.id ? PreggaColors.neutral900 : PreggaColors.neutral500,
              fontWeight: 500,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

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
            <button
              onClick={handleToggleAvailability}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: doula.doula_profiles?.is_available ? PreggaColors.success100 : PreggaColors.neutral100,
                color: doula.doula_profiles?.is_available ? PreggaColors.success700 : PreggaColors.neutral700,
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {doula.doula_profiles?.is_available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              {doula.doula_profiles?.is_available ? "Available" : "Unavailable"}
            </button>
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
              <Card key={client.id} padding="16px">
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
                  <Button variant="outline" size="sm" onClick={() => onViewClient?.(client.id)}>View</Button>
                </div>
              </Card>
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
              <Card key={conv.id} padding="16px">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600 }}>
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>
                        Chat with {conv.pregnant_user?.display_name || "User"}
                      </div>
                      <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                        Started {formatTimeAgo(conv.created_at)}
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

      {activeTab === "verification" && !doula.doula_profiles?.is_available && (
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: PreggaColors.error50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={24} color={PreggaColors.error500} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>
                Deactivate Doula Account
              </h3>
              <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 16px", lineHeight: 1.5 }}>
                Deactivating this doula will remove their verification status and mark them as unavailable.
                They will no longer appear in search results for users.
              </p>
              <Button variant="outline" onClick={handleReject} style={{ borderColor: PreggaColors.error300, color: PreggaColors.error600 }}>
                <Trash2 size={16} />
                Deactivate Account
              </Button>
            </div>
          </div>
        </Card>
      )}

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
