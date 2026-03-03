import { useState, useMemo } from "react";
import { useCountUp } from "../../../hooks";
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
  Users,
  Calendar,
  Mail,
  ArrowLeft,
  Award,
  X,
} from "lucide-react";

interface DoulasViewProps {
  isMobile: boolean;
  subView?: string;
  onNavigateToSubView?: (id: string) => void;
  onGoBack?: () => void;
}

// Get unique specializations from doulas data
const allSpecializations = Array.from(
  new Set(doulasData.flatMap((d) => d.specializations))
);

export function DoulasView({ isMobile, subView, onNavigateToSubView, onGoBack }: DoulasViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredData = useMemo(() => {
    return doulasData.filter((doula) => {
      const matchesSearch =
        doula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doula.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doula.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || doula.status === statusFilter;
      const matchesSpecialization = !specializationFilter || doula.specializations.includes(specializationFilter);

      return matchesSearch && matchesStatus && matchesSpecialization;
    });
  }, [searchQuery, statusFilter, specializationFilter]);

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
  ];

  const hasActiveFilters = statusFilter !== "" || specializationFilter !== "" || searchQuery !== "";

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setSpecializationFilter("");
  };

  const stats = {
    total: doulasData.length,
    verified: doulasData.filter((d) => d.status === "verified").length,
    pending: doulasData.filter((d) => d.status === "pending").length,
    activeClients: doulasData.reduce((sum, d) => sum + d.activeClients, 0),
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
              { value: "verified", label: "Verified" },
              { value: "pending", label: "Pending" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>

        <div style={{ width: 170 }}>
          <Select
            value={specializationFilter}
            onChange={setSpecializationFilter}
            options={[
              { value: "", label: "All Specializations" },
              ...allSpecializations.map((spec) => ({
                value: spec,
                label: spec,
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
          Add Doula
        </Button>
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
          label="Total Doulas"
          value={stats.total}
          icon={<Users size={18} />}
          color={PreggaColors.sage500}
          delay={0}
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={<Award size={18} />}
          color={PreggaColors.sage500}
          delay={100}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Calendar size={18} />}
          color={PreggaColors.warning500}
          delay={200}
        />
        <StatCard
          label="Active Clients"
          value={stats.activeClients}
          icon={<Users size={18} />}
          color={PreggaColors.terracotta500}
          delay={300}
        />
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

      {/* Add Doula Modal */}
      <AddDoulaModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}

function AddDoulaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    yearsExperience: "",
    expertise: [] as string[],
  });

  const expertiseOptions = [
    "Birth support",
    "Postpartum care",
    "Lactation support",
    "Emotional support",
    "Prenatal education",
    "Prenatal yoga",
    "Mental health support",
    "Nutrition guidance",
    "Pain management",
    "Birth planning",
  ];

  const toggleExpertise = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter((e) => e !== expertise)
        : [...prev.expertise, expertise],
    }));
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      yearsExperience: "",
      expertise: [],
    });
    onClose();
  };

  const handleSubmit = () => {
    console.log("Adding doula:", formData);
    handleClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(45, 42, 38, 0.5)",
        backdropFilter: "blur(2px)",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          background: PreggaColors.cream50,
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            background: PreggaColors.white,
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Add Doula
            </h2>
            <p
              style={{
                fontSize: 13,
                color: PreggaColors.neutral500,
                margin: 0,
              }}
            >
              Add a new doula to the platform
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              color: PreggaColors.neutral500,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
            padding: "20px 24px",
            background: PreggaColors.white,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: step >= 1 ? PreggaColors.sage500 : PreggaColors.neutral200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: step >= 1 ? PreggaColors.white : PreggaColors.neutral500,
              }}
            >
              <Users size={16} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: step >= 1 ? PreggaColors.neutral900 : PreggaColors.neutral500,
                fontWeight: step === 1 ? 500 : 400,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Contact Info
            </span>
          </div>

          <div
            style={{
              width: 60,
              height: 2,
              background: step >= 2 ? PreggaColors.sage500 : PreggaColors.neutral200,
              margin: "0 12px",
              marginBottom: 20,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: step >= 2 ? PreggaColors.sage500 : PreggaColors.neutral200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: step >= 2 ? PreggaColors.white : PreggaColors.neutral500,
              }}
            >
              <Award size={16} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: step >= 2 ? PreggaColors.neutral900 : PreggaColors.neutral500,
                fontWeight: step === 2 ? 500 : 400,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Expertise
            </span>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 24px 24px",
          }}
        >
          <Card padding="20px">
            {step === 1 && (
              <>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: PreggaColors.neutral900,
                    margin: "0 0 4px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Contact Information
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: PreggaColors.neutral500,
                    margin: "0 0 20px",
                  }}
                >
                  Basic contact details of the doula you're adding
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="doula@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </>
            )}

            {step === 2 && (
              <>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: PreggaColors.neutral900,
                    margin: "0 0 4px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Expertise & Experience
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: PreggaColors.neutral500,
                    margin: "0 0 20px",
                  }}
                >
                  Areas of expertise and years of experience
                </p>

                <Select
                  label="Years of Experience"
                  value={formData.yearsExperience}
                  onChange={(value) => setFormData({ ...formData, yearsExperience: value })}
                  options={[
                    { value: "", label: "Select experience level..." },
                    { value: "0-2", label: "0-2 years" },
                    { value: "3-5", label: "3-5 years" },
                    { value: "5-10", label: "5-10 years" },
                    { value: "10+", label: "10+ years" },
                  ]}
                  required
                />

                <div style={{ marginTop: 4 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 500,
                      color: PreggaColors.neutral700,
                      marginBottom: 10,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Expertise <span style={{ color: PreggaColors.destructive500 }}>*</span>
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {expertiseOptions.map((expertise) => (
                      <label
                        key={expertise}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: `1px solid ${
                            formData.expertise.includes(expertise)
                              ? PreggaColors.sage500
                              : PreggaColors.neutral200
                          }`,
                          background: formData.expertise.includes(expertise)
                            ? PreggaColors.sage100
                            : PreggaColors.white,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.expertise.includes(expertise)}
                          onChange={() => toggleExpertise(expertise)}
                          style={{ display: "none" }}
                        />
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `2px solid ${
                              formData.expertise.includes(expertise)
                                ? PreggaColors.sage500
                                : PreggaColors.neutral300
                            }`,
                            background: formData.expertise.includes(expertise)
                              ? PreggaColors.sage500
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: PreggaColors.white,
                            fontSize: 10,
                            flexShrink: 0,
                          }}
                        >
                          {formData.expertise.includes(expertise) && "✓"}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            color: PreggaColors.neutral900,
                          }}
                        >
                          {expertise}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: 12,
                      color: PreggaColors.neutral500,
                      marginTop: 10,
                      marginBottom: 0,
                    }}
                  >
                    Selected: {formData.expertise.length} areas
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "16px 24px",
            background: PreggaColors.white,
            borderTop: `1px solid ${PreggaColors.neutral100}`,
          }}
        >
          {step === 1 ? (
            <>
              <div />
              <Button variant="sage" onClick={() => setStep(2)}>
                Next Step
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Previous
              </Button>
              <Button variant="sage" icon={<Users size={16} />} onClick={handleSubmit}>
                Add Doula
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DoulaDetailView({
  doula,
  isMobile,
  onGoBack,
  onViewClient,
}: {
  doula: Doula;
  isMobile: boolean;
  onGoBack?: () => void;
  onViewClient?: (clientId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "sessions" | "delete">("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteDoula = () => {
    console.log("Deleting doula:", doula.id);
    setShowDeleteModal(false);
    onGoBack?.();
  };

  const assignedClients = [
    { id: "1", name: "Emma Wilson", status: "Active client" },
    { id: "2", name: "Isabella Rodriguez", status: "Active client" },
  ];

  const recentSessions = [
    { client: "Emma Wilson", date: "Feb 6, 2026", type: "Video Call", duration: "45 min" },
    { client: "Isabella Rodriguez", date: "Feb 5, 2026", type: "Chat", duration: "30 min" },
    { client: "Emma Wilson", date: "Feb 4, 2026", type: "Chat", duration: "20 min" },
  ];

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
              Doula Profile
            </h1>
            <p
              style={{
                fontSize: 14,
                color: PreggaColors.neutral500,
                margin: 0,
              }}
            >
              View and manage doula details
            </p>
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
        {(["overview", "clients", "sessions", "delete"] as const).map((tab) => (
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
            {tab === "delete" ? "Delete Profile" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Doula Info Card */}
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
                    background: PreggaColors.sage100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PreggaColors.sage600,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {doula.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      color: PreggaColors.neutral900,
                    }}
                  >
                    {doula.name}
                  </div>
                  <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                    {doula.certifications?.[0] || "Certified Doula"}
                  </div>
                </div>
              </div>
              <StatusBadge status={doula.status === "verified" ? "active" : doula.status} />
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
            <InfoCard label="Email" value={doula.email} />
            <InfoCard label="Phone" value={doula.phone} />
            <InfoCard label="Experience" value={`${Math.floor(Math.random() * 8) + 2} years`} />
            <InfoCard label="Active Clients" value={String(doula.activeClients)} />
            <InfoCard label="Total Sessions" value={String(doula.completedSessions)} />
            <InfoCard label="Join Date" value={doula.joinedAt} />
            <InfoCard label="Languages" value="English, Spanish" />
            <InfoCard label="Hourly Rate" value="$75/hour" highlight />
          </div>

          {/* Areas of Expertise */}
          <Card padding="20px">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                marginBottom: 12,
              }}
            >
              <Award size={16} />
              Areas of Expertise
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {doula.specializations.map((spec) => (
                <span
                  key={spec}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 16,
                    background: PreggaColors.neutral100,
                    color: PreggaColors.neutral700,
                    fontSize: 13,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {spec}
                </span>
              ))}
            </div>
          </Card>

          {/* About */}
          <Card padding="20px">
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                marginBottom: 12,
              }}
            >
              About
            </div>
            <p
              style={{
                color: PreggaColors.neutral600,
                lineHeight: 1.6,
                margin: 0,
                fontSize: 14,
              }}
            >
              {doula.bio || "Passionate about supporting families through their pregnancy journey with compassion and evidence-based care."}
            </p>
          </Card>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 8,
            }}
          >
            <Button variant="sage" icon={<Mail size={16} />} style={{ flex: 1 }} onClick={() => setShowEditModal(true)}>
              Edit Profile
            </Button>
            <Button variant="sage" icon={<Users size={16} />} style={{ flex: 1 }} onClick={() => setShowAssignModal(true)}>
              Assign Clients
            </Button>
          </div>
        </div>
      )}

      {activeTab === "clients" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
                color: PreggaColors.neutral700,
              }}
            >
              <Users size={16} />
              Assigned Clients ({assignedClients.length})
            </div>
            <Button variant="sage" size="sm" icon={<Users size={14} />} onClick={() => setShowAssignModal(true)}>
              Assign Clients
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assignedClients.map((client) => (
              <Card key={client.id} padding="16px">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                    >
                      {client.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          color: PreggaColors.neutral900,
                        }}
                      >
                        {client.name}
                      </div>
                      <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                        {client.status}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onViewClient?.(client.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: PreggaColors.sage600,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: PreggaColors.neutral700,
            }}
          >
            <Calendar size={16} />
            Recent Sessions
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentSessions.map((session, index) => (
              <Card key={index} padding="16px">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: PreggaColors.neutral900,
                      }}
                    >
                      {session.client}
                    </div>
                    <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
                      {session.date} • {session.type}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: PreggaColors.sage600,
                    }}
                  >
                    {session.duration}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "delete" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card padding="20px">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                fontWeight: 600,
                color: PreggaColors.destructive500,
                marginBottom: 12,
              }}
            >
              Delete Profile
            </div>
            <p
              style={{
                fontSize: 14,
                color: PreggaColors.neutral600,
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}
            >
              Once you delete this doula profile, there is no going back. This will permanently remove all data associated with this doula including client assignments, session history, and profile information.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
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
              Delete Doula Profile
            </button>
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Doula Profile"
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
        <Input label="Full Name" defaultValue={doula.name} />
        <Input label="Email Address" type="email" defaultValue={doula.email} />
        <Input label="Phone Number" type="tel" defaultValue={doula.phone} />
        <Input label="Hourly Rate" defaultValue="$75" />
        <Select
          label="Primary Specialization"
          value={doula.specializations[0] || ""}
          onChange={() => {}}
          options={[
            { value: "Birth support", label: "Birth Support" },
            { value: "Postpartum", label: "Postpartum Care" },
            { value: "Lactation", label: "Lactation Support" },
            { value: "High-Risk Pregnancy", label: "High-Risk Pregnancy" },
          ]}
        />
      </Modal>

      {/* Assign Clients Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Clients"
        width={480}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAssignModal(false)}>Assign Selected</Button>
          </div>
        }
      >
        <p style={{ fontSize: 14, color: PreggaColors.neutral600, marginTop: 0, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
          Select clients to assign to {doula.name}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
          {["Emma Wilson", "Isabella Rodriguez", "Sarah Johnson", "Maria Garcia", "Jennifer Lee"].map((name, index) => (
            <label
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${PreggaColors.neutral200}`,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <input type="checkbox" defaultChecked={index < 2} style={{ width: 18, height: 18, accentColor: PreggaColors.sage500 }} />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: PreggaColors.primary100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: PreggaColors.primary600,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {name.split(" ").map((n) => n[0]).join("")}
              </div>
              <span style={{ fontSize: 14, color: PreggaColors.neutral900 }}>{name}</span>
            </label>
          ))}
        </div>
      </Modal>

      {/* Delete Doula Modal */}
      <DeleteDoulaModal
        open={showDeleteModal}
        doula={doula}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteDoula}
      />
    </div>
  );
}

function DeleteDoulaModal({
  open,
  doula,
  onClose,
  onConfirm,
}: {
  open: boolean;
  doula: Doula;
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

  if (!open) return null;

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
              background: isConfirmEnabled ? "#DC2626" : PreggaColors.neutral200,
              color: isConfirmEnabled ? PreggaColors.white : PreggaColors.neutral400,
              fontWeight: 500,
              fontSize: 14,
              cursor: isConfirmEnabled ? "pointer" : "not-allowed",
              fontFamily: "'Inter', sans-serif",
              transition: "all 0.15s ease",
            }}
          >
            Delete Doula
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
            background: "#FEE2E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <span style={{ fontSize: 28 }}>⚠️</span>
        </div>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: PreggaColors.neutral900,
            margin: "0 0 8px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Delete Doula Profile
        </h3>
        <p
          style={{
            fontSize: 14,
            color: PreggaColors.neutral500,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to delete <strong style={{ color: PreggaColors.neutral700 }}>{doula.name}</strong>? 
          This action cannot be undone.
        </p>
      </div>

      <div
        style={{
          background: "#FEE2E2",
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
          <li>Doula profile and personal information</li>
          <li>All client assignments</li>
          <li>Session history and records</li>
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
          Type <strong style={{ color: "#DC2626" }}>DELETE</strong> to confirm
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

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
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
          color: highlight ? PreggaColors.info500 : PreggaColors.neutral900,
        }}
      >
        {value}
      </div>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}) {
  const animatedValue = useCountUp(value, 1500, delay);

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
          color: PreggaColors.neutral900,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {animatedValue}
      </div>
    </div>
  );
}
