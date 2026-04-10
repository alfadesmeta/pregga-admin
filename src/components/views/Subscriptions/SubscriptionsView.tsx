import { useState } from "react";
import toast from "react-hot-toast";
import { useCountUp, useSupabasePaginatedQuery, useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge, StatusBadge } from "../../ui/Badge";
import { DataTable } from "../../ui/DataTable";
import { Select } from "../../ui/Select";
import { Modal } from "../../ui/Modal";
import { ShimmerKPICard } from "../../ui/Shimmer";
import { fetchSubscriptions, fetchSubscriptionById, extendSubscription, cancelSubscription, type SubscriptionFilters } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { Subscription, Profile, SubscriptionPlan, SubscriptionStatus } from "../../../types/database";
import { Search, CreditCard, Calendar, X, AlertCircle, Clock, XCircle, Check, User, Settings } from "lucide-react";
import { DetailHeader, TabSelector, Tab } from "../../ui";

interface SubscriptionsViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (subView: string) => void;
  onGoBack?: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPlanLabel(plan: SubscriptionPlan | null | undefined): string {
  if (!plan) return "Unknown";
  const labels: Record<string, string> = {
    monthly: "Monthly",
    pregnancy_postpartum: "Pregnancy + Postpartum",
    yearly: "Yearly",
    six_months: "6 Months",
  };
  return labels[plan] || plan.replace('_', ' ');
}

export function SubscriptionsView({ isMobile, subView, onNavigateToSubView, onGoBack }: SubscriptionsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SubscriptionFilters>({});

  const { data: subscriptions, count, isLoading, error, page, pageSize, totalPages, setPage, refetch } = useSupabasePaginatedQuery<Subscription & { user: Profile }>(
    ['subscriptions', JSON.stringify(filters), searchQuery],
    (from, to) => fetchSubscriptions(from, to, { ...filters, search: searchQuery || undefined }),
    { pageSize: 10 }
  );

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const trialCount = subscriptions.filter(s => s.status === 'trial').length;
  const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;

  const handleSelectSubscription = (id: string) => {
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
    return <SubscriptionDetailView subscriptionId={subView} onGoBack={handleGoBack} onRefresh={refetch} isMobile={isMobile} />;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load subscriptions</h3>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  const columns = [
    {
      key: "user",
      label: "User",
      render: (_: unknown, sub: Subscription & { user: Profile }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary500, fontSize: 13, fontWeight: 600 }}>
            {(sub.user?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>{sub.user?.display_name || "Unknown"}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{sub.user?.email || sub.user?.phone || "No contact"}</div>
          </div>
        </div>
      ),
    },
    { key: "plan_type", label: "Plan", render: (_: unknown, sub: Subscription & { user: Profile }) => <Badge variant="sage">{getPlanLabel(sub.plan_type)}</Badge> },
    { key: "status", label: "Status", render: (_: unknown, sub: Subscription & { user: Profile }) => <StatusBadge status={sub.status ?? "expired"} /> },
    { key: "purchased_at", label: "Start Date", render: (_: unknown, sub: Subscription & { user: Profile }) => <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{sub.purchased_at ? formatDate(sub.purchased_at) : "—"}</span> },
    { key: "expiration_at", label: "End Date", render: (_: unknown, sub: Subscription & { user: Profile }) => <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{sub.expiration_at ? formatDate(sub.expiration_at) : "Ongoing"}</span> },
    { key: "actions", label: "", render: (_: unknown, sub: Subscription & { user: Profile }) => <Button variant="outline" size="sm" onClick={() => handleSelectSubscription(sub.id)}>View</Button> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats Row with Shimmer Loading */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
          <ShimmerKPICard delay={0} />
          <ShimmerKPICard delay={80} />
          <ShimmerKPICard delay={160} />
          <ShimmerKPICard delay={240} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Total" value={count} icon={<CreditCard size={18} />} color={PreggaColors.sage500} delay={0} />
          <StatCard label="Active" value={activeCount} icon={<Check size={18} />} color={PreggaColors.success500} delay={100} />
          <StatCard label="Trial" value={trialCount} icon={<Clock size={18} />} color={PreggaColors.warning500} delay={200} />
          <StatCard label="Cancelled" value={cancelledCount} icon={<XCircle size={18} />} color={PreggaColors.error500} delay={300} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ width: isMobile ? "100%" : 280 }}>
          <Input placeholder="Search by user..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search size={16} />} showClear onClear={() => setSearchQuery("")} />
        </div>
        <div style={{ width: 150 }}>
          <Select value={filters.plan || ""} onChange={(v) => setFilters({ ...filters, plan: v as SubscriptionPlan || undefined })} options={[{ value: "", label: "All Plans" }, { value: "monthly", label: "Monthly" }, { value: "pregnancy_postpartum", label: "Pregnancy + Postpartum" }, { value: "yearly", label: "Yearly" }, { value: "six_months", label: "6 Months" }]} />
        </div>
        <div style={{ width: 130 }}>
          <Select value={filters.status || ""} onChange={(v) => setFilters({ ...filters, status: v as SubscriptionStatus || undefined })} options={[{ value: "", label: "All Status" }, { value: "active", label: "Active" }, { value: "trial", label: "Trial" }, { value: "cancelled", label: "Cancelled" }, { value: "expired", label: "Expired" }]} />
        </div>
        {(searchQuery || filters.plan || filters.status) && (
          <button onClick={() => { setSearchQuery(""); setFilters({}); }} style={{ display: "flex", alignItems: "center", gap: 6, height: 42, padding: "0 14px", borderRadius: 8, border: `1px solid ${PreggaColors.neutral200}`, background: PreggaColors.white, color: PreggaColors.neutral700, fontSize: 14, cursor: "pointer" }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <DataTable columns={columns} data={subscriptions} currentPage={page} totalPages={totalPages} totalItems={count} pageSize={pageSize} onPageChange={setPage} emptyMessage="No subscriptions found" isMobile={isMobile} isLoading={isLoading} mobileCardRender={(sub: Subscription & { user: Profile }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} onClick={() => handleSelectSubscription(sub.id)}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontWeight: 600, fontSize: 14 }}>
                {(sub.user?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{sub.user?.display_name || "Unknown"}</div>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{getPlanLabel(sub.plan_type)}</div>
              </div>
            </div>
            <StatusBadge status={sub.status ?? "expired"} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: PreggaColors.neutral500 }}>
            <span>Start: {sub.purchased_at ? formatDate(sub.purchased_at) : "—"}</span>
            <span>End: {sub.expiration_at ? formatDate(sub.expiration_at) : "Ongoing"}</span>
          </div>
        </div>
      )} />
    </div>
  );
}

function StatCard({ label, value, icon, color, delay = 0 }: { label: string; value: number; icon: React.ReactNode; color: string; delay?: number }) {
  const animatedValue = useCountUp(value, 1500, delay);
  return (
    <div style={{ background: PreggaColors.white, borderRadius: 12, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: PreggaColors.neutral900 }}>{animatedValue}</div>
    </div>
  );
}

function SubscriptionDetailView({ subscriptionId, onGoBack, onRefresh, isMobile }: { subscriptionId: string; onGoBack: () => void; onRefresh: () => void; isMobile: boolean }) {
  const [activeTab, setActiveTab] = useState<"details" | "actions">("details");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [extendDate, setExtendDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState("");

  const { data: subscription, isLoading, error, refetch } = useSupabaseQuery<(Subscription & { user: Profile }) | null>(
    ['subscription', subscriptionId],
    () => fetchSubscriptionById(subscriptionId)
  );

  const handleExtend = async () => {
    if (!subscription || !extendDate) return;
    setIsProcessing(true);
    try {
      await extendSubscription(subscription.id, extendDate);
      toast.success("Subscription extended");
      refetch(); onRefresh(); setShowExtendModal(false);
    } catch (err) { toast.error(friendlyError(err)); } finally { setIsProcessing(false); }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    setIsProcessing(true);
    try {
      await cancelSubscription(subscription.id);
      toast.success("Subscription cancelled");
      refetch(); onRefresh(); setShowCancelModal(false);
    } catch (err) { toast.error(friendlyError(err)); } finally { setIsProcessing(false); }
  };

  if (isLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (error || !subscription) return <div style={{ padding: 40, textAlign: "center" }}><AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} /><h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Subscription not found</h3><Button onClick={onGoBack} style={{ marginTop: 16 }}>Go Back</Button></div>;

  const getStatusGradient = (): [string, string] => {
    if (subscription.status === 'active') return [PreggaColors.sage400, PreggaColors.sage500];
    if (subscription.status === 'trial') return [PreggaColors.warning400, PreggaColors.warning500];
    return [PreggaColors.neutral300, PreggaColors.neutral400];
  };

  const tabs: Tab[] = [
    { id: "details", label: "Details", icon: <CreditCard size={15} /> },
    ...(subscription.status === 'active' ? [{ id: "actions" as const, label: "Actions", icon: <Settings size={15} /> }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <DetailHeader
        title={subscription.user?.display_name || "Subscription"}
        subtitle={subscription.user?.email || subscription.user?.phone || "No contact"}
        avatarFallback={subscription.user?.display_name || "User"}
        avatarGradient={getStatusGradient()}
        avatarIcon={<User size={24} />}
        onGoBack={onGoBack}
        stats={[
          { label: "Plan", value: getPlanLabel(subscription.plan_type), highlight: true },
          { label: "Status", value: subscription.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : "Unknown", highlight: subscription.status === 'active' },
          { label: "Start Date", value: subscription.purchased_at ? formatDate(subscription.purchased_at) : "—" },
          { label: "End Date", value: subscription.expiration_at ? formatDate(subscription.expiration_at) : "Ongoing" },
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
      {activeTab === "details" && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Subscription Information
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontSize: 18, fontWeight: 600 }}>
                {(subscription.user?.display_name || "U").split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900 }}>{subscription.user?.display_name || "Unknown"}</div>
                <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{subscription.user?.email || subscription.user?.phone}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 16, background: PreggaColors.neutral50, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 4 }}>Plan</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900 }}>{getPlanLabel(subscription.plan_type)}</div>
              </div>
              <div style={{ padding: 16, background: PreggaColors.neutral50, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 4 }}>Status</div>
                <div style={{ marginTop: 4 }}><StatusBadge status={subscription.status ?? "expired"} /></div>
              </div>
              <div style={{ padding: 16, background: PreggaColors.neutral50, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 4 }}>Start Date</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900 }}>{subscription.purchased_at ? formatDate(subscription.purchased_at) : "—"}</div>
              </div>
              <div style={{ padding: 16, background: PreggaColors.neutral50, borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: PreggaColors.neutral500, marginBottom: 4 }}>End Date</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900 }}>{subscription.expiration_at ? formatDate(subscription.expiration_at) : "Ongoing"}</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "actions" && subscription.status === 'active' && (
        <Card padding="0">
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Admin Actions
            </h3>
          </div>
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 16px", lineHeight: 1.5 }}>
              Manage this subscription by extending the end date or cancelling.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button icon={<Calendar size={16} />} onClick={() => setShowExtendModal(true)}>Extend Subscription</Button>
              <Button variant="outline" onClick={() => setShowCancelModal(true)} style={{ border: `1px solid ${PreggaColors.error300}`, color: PreggaColors.error600 }}>
                <XCircle size={16} />
                Cancel Subscription
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Modal open={showExtendModal} onClose={() => setShowExtendModal(false)} title="Extend Subscription" width={400} footer={<div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}><Button variant="outline" onClick={() => setShowExtendModal(false)}>Cancel</Button><Button onClick={handleExtend} loading={isProcessing}>Extend</Button></div>}>
        <Input label="New End Date" type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} required />
      </Modal>

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
              Cancel Subscription
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: PreggaColors.error50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <XCircle size={28} color={PreggaColors.error500} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", color: PreggaColors.neutral900 }}>Cancel subscription?</h3>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 20px", lineHeight: 1.5 }}>This will immediately cancel the user's subscription.</p>
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

export default SubscriptionsView;
