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
import { ShimmerKPICard } from "../../ui/Shimmer";
import {
  fetchBroadcasts,
  fetchBroadcastById,
  fetchBroadcastStatusCounts,
  cancelBroadcast,
  type BroadcastFilters,
} from "../../../lib/api";
import { formatTimeAgo } from "../../../lib/formatTime";
import { friendlyError } from "../../../lib/errors";
import type { BroadcastWithDetails, BroadcastStatus } from "../../../types/database";
import {
  Search,
  Radio,
  Clock,
  X,
  AlertCircle,
  XCircle,
  User,
  Users,
  Check,
  Settings,
} from "lucide-react";
import { DetailHeader, TabSelector, Tab } from "../../ui";

interface BroadcastsViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (subView: string) => void;
  onGoBack?: () => void;
  onNavigateToUser?: (userId: string) => void;
  onNavigateToDoula?: (doulaId: string) => void;
}

function getStatusBadgeVariant(status: BroadcastStatus): "sage" | "warning" | "neutral" | "rose" {
  switch (status) {
    case "accepted": return "sage";
    case "pending": return "warning";
    case "expired": return "neutral";
    case "cancelled": return "rose";
    case "no_doulas": return "neutral";
    default: return "neutral";
  }
}

export function BroadcastsView({ isMobile, subView, onNavigateToSubView, onGoBack, onNavigateToUser, onNavigateToDoula }: BroadcastsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<BroadcastFilters>({});

  const {
    data: broadcasts,
    count,
    isLoading,
    error,
    page,
    pageSize,
    totalPages,
    setPage,
    refetch,
  } = useSupabasePaginatedQuery<BroadcastWithDetails>(
    ['broadcasts', JSON.stringify(filters), searchQuery],
    (from, to) => fetchBroadcasts(from, to, { ...filters, search: searchQuery || undefined }),
    { pageSize: 10 }
  );

  const { data: statusCounts } = useSupabaseQuery(
    ['broadcasts', 'status-counts'],
    () => fetchBroadcastStatusCounts()
  );

  const pendingCount = statusCounts?.pending ?? 0;
  const acceptedCount = statusCounts?.accepted ?? 0;
  const expiredCount = statusCounts?.expired ?? 0;

  const hasActiveFilters = searchQuery || filters.status;

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({});
  };

  const handleSelectBroadcast = (id: string) => {
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
      <BroadcastDetailView
        broadcastId={subView}
        onGoBack={handleGoBack}
        onRefresh={refetch}
        isMobile={isMobile}
        onNavigateToUser={onNavigateToUser}
        onNavigateToDoula={onNavigateToDoula}
      />
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load broadcasts</h3>
        <p style={{ color: PreggaColors.neutral500 }}>{friendlyError(error)}</p>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  const columns = [
    {
      key: "user",
      label: "Requesting User",
      render: (_: unknown, broadcast: BroadcastWithDetails) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary500, fontSize: 13, fontWeight: 600 }}>
            {(broadcast.user?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>
              {broadcast.user?.display_name || "Unknown User"}
            </div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
              {formatTimeAgo(broadcast.created_at)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "notified",
      label: "Notified",
      render: (_: unknown, broadcast: BroadcastWithDetails) => (
        <span style={{ fontSize: 14, color: PreggaColors.neutral700 }}>
          {broadcast.notified_doula_ids?.length || 0} doulas
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_: unknown, broadcast: BroadcastWithDetails) => (
        <Badge variant={getStatusBadgeVariant(broadcast.status)}>
          {broadcast.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats with Shimmer Loading */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
          <ShimmerKPICard delay={0} />
          <ShimmerKPICard delay={80} />
          <ShimmerKPICard delay={160} />
          <ShimmerKPICard delay={240} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Total" value={count} icon={<Radio size={18} />} color={PreggaColors.sage500} delay={0} />
          <StatCard label="Pending" value={pendingCount} icon={<Clock size={18} />} color={PreggaColors.warning500} delay={100} />
          <StatCard label="Accepted" value={acceptedCount} icon={<Check size={18} />} color={PreggaColors.success500} delay={200} />
          <StatCard label="Expired" value={expiredCount} icon={<XCircle size={18} />} color={PreggaColors.neutral400} delay={300} />
        </div>
      )}

      {/* Filters */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={16} />} showClear onClear={() => setSearchQuery("")} />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <Select
                value={filters.status || ""}
                onChange={(v) => setFilters({ ...filters, status: v as BroadcastStatus || undefined })}
                options={[
                  { value: "", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "accepted", label: "Accepted" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "expired", label: "Expired" },
                  { value: "no_doulas", label: "No Doulas" },
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
            <Input placeholder="Search by user name or message..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={16} />} showClear onClear={() => setSearchQuery("")} />
          </div>
          <div style={{ width: 150 }}>
            <Select
              value={filters.status || ""}
              onChange={(v) => setFilters({ ...filters, status: v as BroadcastStatus || undefined })}
              options={[
                { value: "", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "accepted", label: "Accepted" },
                { value: "cancelled", label: "Cancelled" },
                { value: "expired", label: "Expired" },
                { value: "no_doulas", label: "No Doulas" },
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
        data={broadcasts}
        currentPage={page}
        totalPages={totalPages}
        totalItems={count}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={(broadcast) => handleSelectBroadcast(broadcast.id)}
        emptyMessage="No broadcast requests found"
        isMobile={isMobile}
        isLoading={isLoading}
        mobileCardRender={(broadcast: BroadcastWithDetails) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} onClick={() => handleSelectBroadcast(broadcast.id)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontWeight: 600, fontSize: 14 }}>
                  {(broadcast.user?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>{broadcast.user?.display_name || "Unknown"}</div>
                  <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{formatTimeAgo(broadcast.created_at)}</div>
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(broadcast.status)}>{broadcast.status.replace('_', ' ')}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: PreggaColors.neutral500 }}>
              <span>{broadcast.notified_doula_ids?.length || 0} doulas notified</span>
              <span>{broadcast.rejections?.length || 0} rejections</span>
            </div>
          </div>
        )}
      />
    </div>
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

function BroadcastDetailView({
  broadcastId,
  onGoBack,
  onRefresh,
  isMobile,
  onNavigateToUser,
  onNavigateToDoula,
}: {
  broadcastId: string;
  onGoBack: () => void;
  onRefresh: () => void;
  isMobile: boolean;
  onNavigateToUser?: (userId: string) => void;
  onNavigateToDoula?: (doulaId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"user" | "doulas" | "actions">("user");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState("");

  const { data: broadcast, isLoading, error, refetch } = useSupabaseQuery<BroadcastWithDetails | null>(
    ['broadcast', broadcastId],
    () => fetchBroadcastById(broadcastId)
  );

  const handleCancel = async () => {
    if (!broadcast) return;
    setIsProcessing(true);
    try {
      await cancelBroadcast(broadcast.id);
      toast.success("Broadcast cancelled");
      refetch();
      onRefresh();
      setShowCancelModal(false);
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  if (error || !broadcast) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Broadcast not found</h3>
        <Button onClick={onGoBack} style={{ marginTop: 16 }}>Go Back</Button>
      </div>
    );
  }

  const getStatusGradient = () => {
    if (broadcast.status === 'accepted') return [PreggaColors.sage400, PreggaColors.sage500];
    if (broadcast.status === 'pending') return [PreggaColors.warning400, PreggaColors.warning500];
    return [PreggaColors.neutral300, PreggaColors.neutral400];
  };

  const tabs: Tab[] = [
    { id: "user", label: "Requester", icon: <User size={15} /> },
    { id: "doulas", label: "Doulas", icon: <Users size={15} /> },
    ...(broadcast.status === 'pending' ? [{ id: "actions" as const, label: "Actions", icon: <Settings size={15} /> }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <DetailHeader
        title="Broadcast Request"
        subtitle="View and manage this broadcast"
        avatarFallback="Broadcast"
        avatarIcon={<Radio size={24} />}
        avatarGradient={getStatusGradient() as [string, string]}
        onGoBack={onGoBack}
        stats={[
          { label: "Status", value: broadcast.status.replace('_', ' '), highlight: broadcast.status === 'accepted' },
          { label: "Notified", value: `${broadcast.notified_doula_ids?.length || 0} doulas` },
          { label: "Rejections", value: String(broadcast.rejections?.length || 0) },
          { label: "Created", value: formatTimeAgo(broadcast.created_at) },
        ]}
        isMobile={isMobile}
        accentColor={`linear-gradient(90deg, ${getStatusGradient()[0]} 0%, ${getStatusGradient()[1]} 100%)`}
      />

      {/* Tabs */}
      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
        isMobile={isMobile}
      />

      {/* Tab Content */}
      {activeTab === "user" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900, display: "flex", alignItems: "center", gap: 8 }}>
              <User size={18} />
              Requesting User
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div 
              onClick={() => broadcast.user?.id && onNavigateToUser?.(broadcast.user.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 16,
                cursor: broadcast.user?.id && onNavigateToUser ? "pointer" : "default",
                padding: 12,
                margin: -12,
                borderRadius: 12,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (broadcast.user?.id && onNavigateToUser) {
                  e.currentTarget.style.background = PreggaColors.neutral50;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 14, background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontSize: 18, fontWeight: 600 }}>
                {(broadcast.user?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900 }}>{broadcast.user?.display_name || "Unknown User"}</div>
                <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{broadcast.user?.email || broadcast.user?.phone || "No contact"}</div>
              </div>
              {broadcast.user?.id && onNavigateToUser && (
                <div style={{ color: PreggaColors.neutral400, fontSize: 12 }}>View Profile →</div>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "doulas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Accepted Doula */}
          {broadcast.accepted_doula && (
            <Card padding="0">
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900, display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={18} color={PreggaColors.success500} />
                  Accepted Doula
                </h3>
              </div>
              <div style={{ padding: 24 }}>
                <div 
                  onClick={() => broadcast.accepted_doula?.id && onNavigateToDoula?.(broadcast.accepted_doula.id)}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 16,
                    cursor: broadcast.accepted_doula?.id && onNavigateToDoula ? "pointer" : "default",
                    padding: 12,
                    margin: -12,
                    borderRadius: 12,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (broadcast.accepted_doula?.id && onNavigateToDoula) {
                      e.currentTarget.style.background = PreggaColors.neutral50;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: PreggaColors.sage100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.sage600, fontSize: 18, fontWeight: 600 }}>
                    {(broadcast.accepted_doula?.display_name || "D").split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900 }}>{broadcast.accepted_doula?.display_name || "Unknown Doula"}</div>
                    <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{broadcast.accepted_doula?.email || broadcast.accepted_doula?.phone || "No contact"}</div>
                  </div>
                  {broadcast.accepted_doula?.id && onNavigateToDoula && (
                    <div style={{ color: PreggaColors.neutral400, fontSize: 12 }}>View Profile →</div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Rejections */}
          {broadcast.rejections && broadcast.rejections.length > 0 && (
            <Card padding="0">
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900, display: "flex", alignItems: "center", gap: 8 }}>
                  <XCircle size={18} color={PreggaColors.error500} />
                  Rejections ({broadcast.rejections.length})
                </h3>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {broadcast.rejections.map((rejection) => (
                    <div 
                      key={rejection.id} 
                      onClick={() => rejection.doula?.id && onNavigateToDoula?.(rejection.doula.id)}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        padding: 12, 
                        background: PreggaColors.neutral50, 
                        borderRadius: 8,
                        cursor: rejection.doula?.id && onNavigateToDoula ? "pointer" : "default",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (rejection.doula?.id && onNavigateToDoula) {
                          e.currentTarget.style.background = PreggaColors.neutral100;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = PreggaColors.neutral50;
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: PreggaColors.rose100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.rose600, fontSize: 12, fontWeight: 600 }}>
                          {(rejection.doula?.display_name || "D").split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{rejection.doula?.display_name || "Unknown Doula"}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{formatTimeAgo(rejection.rejected_at)}</span>
                        {rejection.doula?.id && onNavigateToDoula && (
                          <span style={{ color: PreggaColors.neutral400, fontSize: 11 }}>→</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Empty state for doulas tab */}
          {!broadcast.accepted_doula && (!broadcast.rejections || broadcast.rejections.length === 0) && (
            <Card padding="40px">
              <div style={{ textAlign: "center", color: PreggaColors.neutral400 }}>
                <Users size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No doula responses yet</div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "actions" && broadcast.status === 'pending' && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Admin Actions
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 16px", lineHeight: 1.5 }}>
              Cancel this broadcast request if it's no longer needed.
            </p>
            <Button variant="outline" onClick={() => setShowCancelModal(true)} style={{ borderWidth: 1, borderStyle: "solid", borderColor: PreggaColors.error300, color: PreggaColors.error600 }}>
              <XCircle size={16} />
              Cancel Broadcast
            </Button>
          </div>
        </Card>
      )}

      {/* Cancel Modal with DELETE verification */}
      <Modal
        open={showCancelModal}
        onClose={() => { setShowCancelModal(false); setCancelConfirmText(""); }}
        title=""
        width={420}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => { setShowCancelModal(false); setCancelConfirmText(""); }}>Keep Active</Button>
            <Button 
              onClick={handleCancel} 
              loading={isProcessing} 
              disabled={cancelConfirmText !== "DELETE"}
              style={{ 
                background: cancelConfirmText === "DELETE" ? PreggaColors.error500 : PreggaColors.neutral300,
                cursor: cancelConfirmText === "DELETE" ? "pointer" : "not-allowed",
              }}
            >
              Cancel Broadcast
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: PreggaColors.error50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <XCircle size={28} color={PreggaColors.error500} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>Cancel this broadcast?</h3>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 20px", lineHeight: 1.5 }}>
            This will cancel the broadcast request. The user will need to create a new request to connect with a doula.
          </p>
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 8 }}>
              Type <span style={{ fontFamily: "monospace", background: PreggaColors.neutral100, padding: "2px 6px", borderRadius: 4, color: PreggaColors.error600 }}>DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={cancelConfirmText}
              onChange={(e) => setCancelConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 14,
                border: `1px solid ${cancelConfirmText === "DELETE" ? PreggaColors.error400 : PreggaColors.neutral200}`,
                borderRadius: 8,
                outline: "none",
                fontFamily: "monospace",
                letterSpacing: "1px",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = PreggaColors.error400}
              onBlur={(e) => e.currentTarget.style.borderColor = cancelConfirmText === "DELETE" ? PreggaColors.error400 : PreggaColors.neutral200}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BroadcastsView;
