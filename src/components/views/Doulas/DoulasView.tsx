import { useState, useMemo } from "react";
import { PreggaColors } from "../../../theme/colors";
import { DataTable, TableColumn } from "../../ui/DataTable";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { StatusBadge, Badge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { usePagination } from "../../../hooks";
import { doulasData } from "../../../data/mockData";
import type { Doula } from "../../../types";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Star,
  Users,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  Award,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface DoulasViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
}

export function DoulasView({ isMobile, subView, onNavigateToSubView, onGoBack }: DoulasViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"verified" | "pending" | "all">("verified");

  const filteredData = useMemo(() => {
    return doulasData.filter((doula) => {
      const matchesSearch =
        doula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doula.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doula.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || doula.status === statusFilter;
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "verified" && doula.status === "verified") ||
        (activeTab === "pending" && doula.status === "pending");

      return matchesSearch && matchesStatus && matchesTab;
    });
  }, [searchQuery, statusFilter, activeTab]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
    setPageSize,
  } = usePagination(filteredData, { initialPageSize: 10 });

  if (subView) {
    const doula = doulasData.find((d) => d.id === subView);
    if (doula) {
      return <DoulaDetailView doula={doula} isMobile={isMobile} onGoBack={onGoBack} />;
    }
  }

  const columns: TableColumn<Doula>[] = [
    {
      key: "name",
      label: "Doula",
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
            }}
          >
            {row.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: PreggaColors.neutral900 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "specializations",
      label: "Specializations",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {row.specializations.slice(0, 2).map((spec) => (
            <Badge key={spec} variant="sage" size="sm">
              {spec}
            </Badge>
          ))}
          {row.specializations.length > 2 && (
            <Badge variant="neutral" size="sm">
              +{row.specializations.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (_, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Star size={14} fill={PreggaColors.warning500} style={{ color: PreggaColors.warning500 }} />
          <span style={{ fontWeight: 600 }}>{row.rating}</span>
        </div>
      ),
    },
    {
      key: "activeClients",
      label: "Clients",
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.activeClients} active</div>
          <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{row.totalClients} total</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      render: () => (
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
            color: PreggaColors.neutral400,
            display: "flex",
          }}
        >
          <MoreVertical size={16} />
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <StatCard
          label="Total Doulas"
          value={doulasData.length}
          icon={<Users size={18} />}
          color={PreggaColors.primary500}
        />
        <StatCard
          label="Verified"
          value={doulasData.filter((d) => d.status === "verified").length}
          icon={<CheckCircle size={18} />}
          color={PreggaColors.success500}
        />
        <StatCard
          label="Pending"
          value={doulasData.filter((d) => d.status === "pending").length}
          icon={<Award size={18} />}
          color={PreggaColors.warning500}
        />
        <StatCard
          label="Avg Rating"
          value={(doulasData.reduce((acc, d) => acc + d.rating, 0) / doulasData.length).toFixed(1)}
          icon={<Star size={18} />}
          color={PreggaColors.warning500}
        />
      </div>

      {/* Filters */}
      <Card padding="16px">
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, maxWidth: isMobile ? "100%" : 300 }}>
            <Input
              placeholder="Search doulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ width: 150 }}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "", label: "All Status" },
                  { value: "verified", label: "Verified" },
                  { value: "pending", label: "Pending" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>

            <Button variant="outline" icon={<Filter size={16} />}>
              Filters
            </Button>

            <Button variant="outline" icon={<Download size={16} />}>
              Export
            </Button>

            <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              Add Doula
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["verified", "pending", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px 8px 0 0",
              border: "none",
              background: activeTab === tab ? PreggaColors.white : "transparent",
              color: activeTab === tab ? PreggaColors.primary700 : PreggaColors.neutral500,
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              borderBottom: activeTab === tab ? `2px solid ${PreggaColors.primary500}` : "none",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedData}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={goToPage}
        onPageSizeChange={setPageSize}
        onRowClick={(row) => onNavigateToSubView?.(row.id)}
        emptyMessage="No doulas found"
      />

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Doula"
        width={520}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddModal(false)}>Send Invitation</Button>
          </div>
        }
      >
        <Input label="Full Name" placeholder="Enter doula's name" required />
        <Input label="Email Address" type="email" placeholder="Enter email" required />
        <Input label="Phone Number" type="tel" placeholder="Enter phone number" />
        <Select
          label="Primary Specialization"
          value=""
          onChange={() => {}}
          options={[
            { value: "labor", label: "Labor Support" },
            { value: "postpartum", label: "Postpartum Care" },
            { value: "breastfeeding", label: "Breastfeeding Support" },
            { value: "highrisk", label: "High-Risk Pregnancy" },
          ]}
          placeholder="Select specialization"
        />
      </Modal>
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

function DoulaDetailView({
  doula,
  isMobile,
  onGoBack,
}: {
  doula: Doula;
  isMobile: boolean;
  onGoBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        onClick={onGoBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: PreggaColors.neutral600,
          fontSize: 14,
          fontFamily: "'Inter', sans-serif",
          padding: 0,
        }}
      >
        <ArrowLeft size={18} />
        Back to Doulas
      </button>

      {/* Header */}
      <Card padding="24px">
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: PreggaColors.primary100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.primary500,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {doula.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: PreggaColors.neutral900,
                  margin: 0,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {doula.name}
              </h2>
              <StatusBadge status={doula.status} />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={16} fill={PreggaColors.warning500} style={{ color: PreggaColors.warning500 }} />
                <span style={{ fontWeight: 600 }}>{doula.rating}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: PreggaColors.neutral500, fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={14} /> {doula.email}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={14} /> {doula.phone}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} /> Joined {doula.joinedAt}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {doula.status === "pending" && (
              <>
                <Button variant="outline" icon={<XCircle size={16} />}>
                  Reject
                </Button>
                <Button variant="sage" icon={<CheckCircle size={16} />}>
                  Verify
                </Button>
              </>
            )}
            {doula.status === "verified" && (
              <>
                <Button variant="outline">Edit Profile</Button>
                <Button icon={<MessageCircle size={16} />}>Contact</Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <StatCard label="Active Clients" value={doula.activeClients} icon={<Users size={18} />} color={PreggaColors.accent500} />
        <StatCard label="Total Clients" value={doula.totalClients} icon={<Users size={18} />} color={PreggaColors.primary500} />
        <StatCard label="Sessions" value={doula.completedSessions} icon={<MessageCircle size={18} />} color={PreggaColors.primary500} />
        <StatCard label="Rating" value={doula.rating} icon={<Star size={18} />} color={PreggaColors.warning500} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${PreggaColors.primary100}` }}>
        {["profile", "clients", "reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 20px",
              border: "none",
              background: "transparent",
              color: activeTab === tab ? PreggaColors.primary700 : PreggaColors.neutral500,
              fontWeight: activeTab === tab ? 600 : 400,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              borderBottom: activeTab === tab ? `2px solid ${PreggaColors.primary500}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
          <Card title="Bio" padding="20px">
            <p style={{ color: PreggaColors.neutral700, lineHeight: 1.6, margin: 0 }}>
              {doula.bio || "No bio provided."}
            </p>
          </Card>
          <Card title="Specializations" padding="20px">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {doula.specializations.map((spec) => (
                <Badge key={spec} variant="sage">
                  {spec}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "clients" && (
        <Card title="Assigned Clients" padding="20px">
          <div style={{ textAlign: "center", padding: 40, color: PreggaColors.neutral500 }}>
            Client list coming soon...
          </div>
        </Card>
      )}

      {activeTab === "reviews" && (
        <Card title="Client Reviews" padding="20px">
          <div style={{ textAlign: "center", padding: 40, color: PreggaColors.neutral500 }}>
            Reviews coming soon...
          </div>
        </Card>
      )}
    </div>
  );
}
