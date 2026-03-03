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
  Heart,
  ArrowLeft,
  X,
  Trash2,
  AlertTriangle,
  Pencil,
} from "lucide-react";
import { doulasData } from "../../../data/mockData";

interface UsersViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
}

export function UsersView({ isMobile, subView, onNavigateToSubView, onGoBack }: UsersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [doulaFilter, setDoulaFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredData = useMemo(() => {
    return usersData.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || user.status === statusFilter;
      const matchesDoula = !doulaFilter || user.assignedDoulaId === doulaFilter;

      return matchesSearch && matchesStatus && matchesDoula;
    });
  }, [searchQuery, statusFilter, doulaFilter]);

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
  ];

  const hasActiveFilters = statusFilter !== "" || doulaFilter !== "" || searchQuery !== "";

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDoulaFilter("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filters Row - No Card wrapper */}
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
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ width: 130 }}>
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

        <div style={{ width: 150 }}>
          <Select
            value={doulaFilter}
            onChange={setDoulaFilter}
            options={[
              { value: "", label: "All Doulas" },
              ...doulasData.map((doula) => ({
                value: doula.id,
                label: doula.name,
              })),
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
              whiteSpace: "nowrap",
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}

        <div style={{ flex: 1 }} />

        <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
          Add User
        </Button>
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
  const [activeTab, setActiveTab] = useState<"overview" | "payments">("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const subscriptionPlan = "Premium";
  const totalSessions = 45;
  const lastActive = "2 min ago";
  const age = 28;

  const paymentHistory = [
    { amount: "$49.99", date: "Feb 1, 2026", method: "Credit Card", status: "Paid" },
    { amount: "$49.99", date: "Jan 1, 2026", method: "Credit Card", status: "Paid" },
  ];

  const handleDeleteUser = () => {
    console.log("Deleting user:", user.id);
    setShowDeleteModal(false);
    onGoBack?.();
  };

  const handleRevokeAccess = () => {
    console.log("Revoking access for user:", user.id);
    setShowRevokeModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
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
                fontSize: 22,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              User Profile
            </h1>
            <p
              style={{
                fontSize: 14,
                color: PreggaColors.neutral500,
                margin: 0,
              }}
            >
              View and manage user details
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button icon={<Pencil size={16} />} onClick={() => setShowEditModal(true)}>
            Edit Profile
          </Button>
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#FEE2E2",
              color: "#DC2626",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FECACA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FEE2E2";
            }}
          >
            <Trash2 size={16} />
            Delete User
          </button>
        </div>
      </div>

      {/* Stats Banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PreggaColors.sage500} 0%, ${PreggaColors.sage400} 100%)`,
          borderRadius: 16,
          padding: "24px 32px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Subscription Plan
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: PreggaColors.white,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {subscriptionPlan}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Total Sessions
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: PreggaColors.white,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {totalSessions}
          </div>
        </div>
        <div style={{ textAlign: isMobile ? "left" : "right" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Last Active
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: PreggaColors.white,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {lastActive}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          background: PreggaColors.neutral100,
          borderRadius: 12,
          padding: 4,
          width: "fit-content",
        }}
      >
        {(["overview", "payments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 32px",
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* User Info Card */}
          <Card padding="20px">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: PreggaColors.primary100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PreggaColors.primary600,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      color: PreggaColors.neutral900,
                    }}
                  >
                    {user.name}
                  </div>
                  <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                    {user.phone}
                  </div>
                </div>
              </div>
              <StatusBadge status={user.status} />
            </div>
          </Card>

          {/* Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
            }}
          >
            <InfoCard label="Pregnancy Stage" value={user.pregnancyWeek ? `${user.pregnancyWeek} weeks` : "—"} />
            <InfoCard label="Due Date" value={user.dueDate || "—"} />
            <InfoCard label="Age" value={`${age} years`} />
            <InfoCard label="Join Date" value={user.joinedAt} />
            <InfoCard label="Subscription Plan" value={subscriptionPlan} />
            <InfoCard label="Total Sessions" value={String(totalSessions)} />
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Subscription Management Card */}
          <div
            style={{
              background: `linear-gradient(135deg, ${PreggaColors.sage100} 0%, #E8F0E9 100%)`,
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: PreggaColors.neutral900,
                marginBottom: 16,
              }}
            >
              Subscription Management
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, color: PreggaColors.neutral600 }}>
                  Current Status
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: PreggaColors.success500,
                  }}
                >
                  Paid
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, color: PreggaColors.neutral600 }}>
                  Plan
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: PreggaColors.neutral900,
                  }}
                >
                  Premium - $49.99/month
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, color: PreggaColors.neutral600 }}>
                  Next Billing
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: PreggaColors.neutral900,
                  }}
                >
                  Mar 1, 2026
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowRevokeModal(true)}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "12px 20px",
                borderRadius: 8,
                border: "none",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
            >
              Revoke Access
            </button>
          </div>

          {/* Payment History */}
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: PreggaColors.neutral900,
                marginBottom: 12,
              }}
            >
              Payment History
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {paymentHistory.map((payment, index) => (
                <Card key={index} padding="16px">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: PreggaColors.neutral900,
                        }}
                      >
                        {payment.amount}
                      </div>
                      <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                        {payment.date} • {payment.method}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: PreggaColors.success500,
                      }}
                    >
                      {payment.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <DeleteUserModal
        open={showDeleteModal}
        user={user}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUser}
      />

      {/* Edit User Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User Profile"
        width={520}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditModal(false)}>Save Changes</Button>
          </div>
        }
      >
        <Input label="Full Name" defaultValue={user.name} />
        <Input label="Email Address" type="email" defaultValue={user.email} />
        <Input label="Phone Number" type="tel" defaultValue={user.phone} />
        <Input label="Due Date" type="date" defaultValue={user.dueDate || ""} />
        <Select
          label="Status"
          value={user.status}
          onChange={() => {}}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "pending", label: "Pending" },
          ]}
        />
      </Modal>

      {/* Revoke Access Modal */}
      <Modal
        open={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title=""
        width={400}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setShowRevokeModal(false)}>
              Cancel
            </Button>
            <button
              onClick={handleRevokeAccess}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "#EF4444",
                color: PreggaColors.white,
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Revoke Access
            </button>
          </div>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#FEE2E2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertTriangle size={28} color="#EF4444" />
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
            Revoke Subscription Access?
          </h3>
          <p
            style={{
              fontSize: 14,
              color: PreggaColors.neutral500,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            This will immediately revoke <strong style={{ color: PreggaColors.neutral700 }}>{user.name}</strong>'s 
            access to premium features. They will be downgraded to the free plan.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="16px">
      <div
        style={{
          fontSize: 13,
          color: PreggaColors.neutral500,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: PreggaColors.neutral900,
        }}
      >
        {value}
      </div>
    </Card>
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

function DeleteUserModal({
  open,
  user,
  onClose,
  onConfirm,
}: {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    setConfirmText("");
    onConfirm();
  };

  const isConfirmEnabled = confirmText.toLowerCase() === "delete";

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title=""
      width={440}
      footer={
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: isConfirmEnabled ? PreggaColors.destructive500 : PreggaColors.neutral200,
              color: isConfirmEnabled ? PreggaColors.white : PreggaColors.neutral400,
              fontWeight: 500,
              fontSize: 14,
              cursor: isConfirmEnabled ? "pointer" : "not-allowed",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s ease",
            }}
          >
            Delete User
          </button>
        </div>
      }
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: PreggaColors.destructive50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={32} color={PreggaColors.destructive500} />
        </div>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: PreggaColors.neutral900,
            margin: "0 0 8px",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Delete User
        </h3>
        <p
          style={{
            fontSize: 14,
            color: PreggaColors.neutral500,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to delete <strong style={{ color: PreggaColors.neutral700 }}>{user.name}</strong>? 
          This action cannot be undone and all user data will be permanently removed.
        </p>
      </div>

      <div
        style={{
          background: PreggaColors.destructive50,
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, color: PreggaColors.neutral600, marginBottom: 8 }}>
          This will permanently delete:
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 20,
            fontSize: 13,
            color: PreggaColors.neutral700,
            lineHeight: 1.8,
          }}
        >
          <li>User profile and personal information</li>
          <li>All conversation history</li>
          <li>Subscription and payment records</li>
          <li>Associated doula assignments</li>
        </ul>
      </div>

      <div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: PreggaColors.neutral700,
            marginBottom: 6,
          }}
        >
          Type <strong style={{ color: PreggaColors.destructive500 }}>DELETE</strong> to confirm
        </label>
        <Input
          placeholder="Type DELETE to confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          style={{ marginBottom: 0 }}
        />
      </div>
    </Modal>
  );
}
