import { useState, useMemo } from "react";
import { PreggaColors } from "../../../theme/colors";
import { DataTable, TableColumn } from "../../ui/DataTable";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { StatusBadge } from "../../ui/Badge";
import { Card } from "../../ui/Card";
import { Modal } from "../../ui/Modal";
import { usePagination } from "../../../hooks";
import { usersData } from "../../../data/mockData";
import type { User } from "../../../types";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  Mail,
  Phone,
  Heart,
  User as UserIcon,
  ArrowLeft,
} from "lucide-react";

interface UsersViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
}

export function UsersView({ isMobile, subView, onNavigateToSubView, onGoBack }: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  const filteredData = useMemo(() => {
    return usersData.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesTab = activeTab === "all" || user.status === "active";

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
    const user = usersData.find((u) => u.id === subView);
    if (user) {
      return (
        <UserDetailView
          user={user}
          isMobile={isMobile}
          onGoBack={onGoBack}
        />
      );
    }
  }

  const columns: TableColumn<User>[] = [
    {
      key: "name",
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
      key: "pregnancyWeek",
      label: "Pregnancy",
      render: (_, row) =>
        row.pregnancyWeek ? (
          <div>
            <div style={{ fontWeight: 500 }}>Week {row.pregnancyWeek}</div>
            <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>Due: {row.dueDate}</div>
          </div>
        ) : (
          <span style={{ color: PreggaColors.neutral400 }}>—</span>
        ),
    },
    {
      key: "assignedDoula",
      label: "Assigned Doula",
      render: (_, row) =>
        row.assignedDoula ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Heart size={14} style={{ color: PreggaColors.primary500 }} />
            <span>{row.assignedDoula}</span>
          </div>
        ) : (
          <span style={{ color: PreggaColors.neutral400 }}>Unassigned</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      key: "lastActive",
      label: "Last Active",
      render: (value) => (
        <span style={{ color: PreggaColors.neutral500, fontSize: 13 }}>{value as string}</span>
      ),
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
              placeholder="Search users..."
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
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </div>

            <Button variant="outline" icon={<Filter size={16} />}>
              More Filters
            </Button>

            <Button variant="outline" icon={<Download size={16} />}>
              Export
            </Button>

            <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              Add User
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4 }}>
        {(["active", "all"] as const).map((tab) => (
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
            {tab === "active" ? "Active Users" : "All Users"}
            <span
              style={{
                marginLeft: 8,
                padding: "2px 8px",
                borderRadius: 12,
                background: activeTab === tab ? PreggaColors.primary100 : PreggaColors.neutral100,
                fontSize: 12,
              }}
            >
              {tab === "active"
                ? usersData.filter((u) => u.status === "active").length
                : usersData.length}
            </span>
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
        emptyMessage="No users found"
      />

      {/* Add User Modal */}
      <AddUserModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

function UserDetailView({
  user,
  isMobile,
  onGoBack,
}: {
  user: User;
  isMobile: boolean;
  onGoBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Back Button */}
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
        Back to Users
      </button>

      {/* User Header */}
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
            {user.name.split(" ").map((n) => n[0]).join("")}
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
                {user.name}
              </h2>
              <StatusBadge status={user.status} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, color: PreggaColors.neutral500, fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={14} /> {user.email}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={14} /> {user.phone}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} /> Joined {user.joinedAt}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="outline">Edit Profile</Button>
            <Button>Send Message</Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${PreggaColors.primary100}` }}>
        {["profile", "pregnancy", "activity"].map((tab) => (
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
          <Card title="Personal Information" padding="20px">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone} />
              <InfoRow label="User ID" value={user.id} />
              <InfoRow label="Last Active" value={user.lastActive || "—"} />
            </div>
          </Card>
          <Card title="Assigned Doula" padding="20px">
            {user.assignedDoula ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: PreggaColors.primary100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PreggaColors.primary500,
                  }}
                >
                  <Heart size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, color: PreggaColors.neutral900 }}>{user.assignedDoula}</div>
                  <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>ID: {user.assignedDoulaId}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 20, color: PreggaColors.neutral500 }}>
                <UserIcon size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No doula assigned yet</div>
                <Button variant="outline" size="sm" style={{ marginTop: 12 }}>
                  Assign Doula
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "pregnancy" && (
        <Card title="Pregnancy Details" padding="20px">
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 20 }}>
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: PreggaColors.primary50,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 700, color: PreggaColors.primary500 }}>
                {user.pregnancyWeek || "—"}
              </div>
              <div style={{ fontSize: 14, color: PreggaColors.neutral600 }}>Current Week</div>
            </div>
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: PreggaColors.accent100,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: PreggaColors.accent500 }}>
                {user.dueDate || "—"}
              </div>
              <div style={{ fontSize: 14, color: PreggaColors.neutral600 }}>Due Date</div>
            </div>
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: PreggaColors.primary50,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: PreggaColors.primary600 }}>
                {user.pregnancyWeek ? Math.ceil((40 - user.pregnancyWeek) * 7) : "—"}
              </div>
              <div style={{ fontSize: 14, color: PreggaColors.neutral600 }}>Days Remaining</div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card title="Recent Activity" padding="20px">
          <div style={{ textAlign: "center", padding: 40, color: PreggaColors.neutral500 }}>
            Activity timeline coming soon...
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: PreggaColors.neutral500, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>{value}</span>
    </div>
  );
}

function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New User"
      width={480}
      footer={
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Add User</Button>
        </div>
      }
    >
      <Input
        label="Full Name"
        placeholder="Enter full name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Phone Number"
        type="tel"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
    </Modal>
  );
}
