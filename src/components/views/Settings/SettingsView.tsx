import { useState } from "react";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Select } from "../../ui/Select";
import { Badge } from "../../ui/Badge";
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface SettingsViewProps {
  isMobile: boolean;
}

export function SettingsView({ isMobile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${PreggaColors.primary100}`,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                border: "none",
                background: "transparent",
                color: activeTab === tab.id ? PreggaColors.primary700 : PreggaColors.neutral500,
                fontWeight: activeTab === tab.id ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                borderBottom:
                  activeTab === tab.id
                    ? `2px solid ${PreggaColors.primary500}`
                    : "2px solid transparent",
                marginBottom: -1,
                whiteSpace: "nowrap",
              }}
            >
              <IconComponent size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <ProfileSettings isMobile={isMobile} />}
      {activeTab === "security" && <SecuritySettings isMobile={isMobile} />}
      {activeTab === "notifications" && <NotificationSettings isMobile={isMobile} />}
      {activeTab === "appearance" && <AppearanceSettings isMobile={isMobile} />}
    </div>
  );
}

function ProfileSettings({ isMobile }: { isMobile: boolean }) {
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@pregga.com",
    phone: "(555) 123-4567",
    role: "Super Admin",
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
      <Card title="Personal Information" padding="24px">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Button>Save Changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>

      <Card title="Account Details" padding="24px">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InfoRow label="User ID" value="ADM-001" />
          <InfoRow label="Role" value={formData.role} badge />
          <InfoRow label="Account Created" value="Jan 1, 2024" />
          <InfoRow label="Last Login" value="Today, 10:30 AM" />
          <InfoRow label="Status" value="Active" status="success" />
        </div>
      </Card>
    </div>
  );
}

function SecuritySettings({ isMobile }: { isMobile: boolean }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const passwordRequirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "Contains number", met: /\d/.test(newPassword) },
    { label: "Contains special character", met: /[!@#$%^&*]/.test(newPassword) },
  ];

  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
      <Card title="Change Password" padding="24px">
        <div style={{ position: "relative" }}>
          <Input
            label="Current Password"
            type={showPasswords.current ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            style={{
              position: "absolute",
              right: 14,
              top: 36,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: PreggaColors.neutral400,
              padding: 4,
              display: "flex",
            }}
          >
            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <Input
            label="New Password"
            type={showPasswords.new ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            style={{
              position: "absolute",
              right: 14,
              top: 36,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: PreggaColors.neutral400,
              padding: 4,
              display: "flex",
            }}
          >
            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <Input
            label="Confirm New Password"
            type={showPasswords.confirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            error={confirmPassword && !passwordsMatch ? "Passwords do not match" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            style={{
              position: "absolute",
              right: 14,
              top: 36,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: PreggaColors.neutral400,
              padding: 4,
              display: "flex",
            }}
          >
            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button disabled={!passwordsMatch || passwordRequirements.some((r) => !r.met)}>
          Update Password
        </Button>
      </Card>

      <Card title="Password Requirements" padding="24px">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {passwordRequirements.map((req) => (
            <div
              key={req.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: req.met ? PreggaColors.success600 : PreggaColors.neutral500,
              }}
            >
              {req.met ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span style={{ fontSize: 14 }}>{req.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 10,
            background: PreggaColors.primary50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Shield size={18} style={{ color: PreggaColors.primary600 }} />
            <span style={{ fontWeight: 600, color: PreggaColors.neutral900 }}>Security Tips</span>
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 13,
              color: PreggaColors.neutral600,
              lineHeight: 1.8,
            }}
          >
            <li>Never share your password with anyone</li>
            <li>Use a unique password for this account</li>
            <li>Consider using a password manager</li>
            <li>Enable two-factor authentication</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

function NotificationSettings({ isMobile: _isMobile }: { isMobile: boolean }) {
  const [notifications, setNotifications] = useState({
    newUsers: true,
    newDoulas: true,
    chatAlerts: true,
    payments: true,
    systemUpdates: false,
    weeklyReport: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <Card title="Email Notifications" padding="24px">
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <NotificationToggle
          title="New User Registrations"
          description="Get notified when new users sign up"
          enabled={notifications.newUsers}
          onToggle={() => toggleNotification("newUsers")}
        />
        <NotificationToggle
          title="New Doula Applications"
          description="Get notified when doulas apply to join"
          enabled={notifications.newDoulas}
          onToggle={() => toggleNotification("newDoulas")}
        />
        <NotificationToggle
          title="Chat Alerts"
          description="Get notified about flagged conversations"
          enabled={notifications.chatAlerts}
          onToggle={() => toggleNotification("chatAlerts")}
        />
        <NotificationToggle
          title="Payment Notifications"
          description="Get notified about transactions and refunds"
          enabled={notifications.payments}
          onToggle={() => toggleNotification("payments")}
        />
        <NotificationToggle
          title="System Updates"
          description="Get notified about platform updates"
          enabled={notifications.systemUpdates}
          onToggle={() => toggleNotification("systemUpdates")}
        />
        <NotificationToggle
          title="Weekly Report"
          description="Receive weekly analytics summary"
          enabled={notifications.weeklyReport}
          onToggle={() => toggleNotification("weeklyReport")}
          isLast
        />
      </div>
    </Card>
  );
}

function NotificationToggle({
  title,
  description,
  enabled,
  onToggle,
  isLast = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: isLast ? "none" : `1px solid ${PreggaColors.primary100}`,
      }}
    >
      <div>
        <div style={{ fontWeight: 500, color: PreggaColors.neutral900, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{description}</div>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 48,
          height: 26,
          borderRadius: 13,
          border: "none",
          background: enabled ? PreggaColors.accent500 : PreggaColors.neutral200,
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: PreggaColors.white,
            position: "absolute",
            top: 2,
            left: enabled ? 24 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

function AppearanceSettings({ isMobile }: { isMobile: boolean }) {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("pst");

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
      <Card title="Display Settings" padding="24px">
        <Select
          label="Theme"
          value={theme}
          onChange={setTheme}
          options={[
            { value: "light", label: "Light Mode" },
            { value: "dark", label: "Dark Mode (Coming Soon)" },
            { value: "system", label: "System Default" },
          ]}
        />
        <Select
          label="Language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "en", label: "English" },
            { value: "es", label: "Spanish (Coming Soon)" },
            { value: "fr", label: "French (Coming Soon)" },
          ]}
        />
        <Select
          label="Timezone"
          value={timezone}
          onChange={setTimezone}
          options={[
            { value: "pst", label: "Pacific Time (PT)" },
            { value: "mst", label: "Mountain Time (MT)" },
            { value: "cst", label: "Central Time (CT)" },
            { value: "est", label: "Eastern Time (ET)" },
          ]}
        />
        <Button>Save Preferences</Button>
      </Card>

      <Card title="About" padding="24px">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Build" value="2026.02.27" />
          <InfoRow label="Environment" value="Production" badge />
          <div style={{ marginTop: 8 }}>
            <Button variant="outline" fullWidth>
              Check for Updates
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  badge = false,
  status,
}: {
  label: string;
  value: string;
  badge?: boolean;
  status?: "success" | "warning" | "danger";
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: PreggaColors.neutral500, fontSize: 14 }}>{label}</span>
      {badge ? (
        <Badge variant="sage">{value}</Badge>
      ) : status ? (
        <Badge variant={status} dot>
          {value}
        </Badge>
      ) : (
        <span style={{ fontWeight: 500, color: PreggaColors.neutral900, fontSize: 14 }}>{value}</span>
      )}
    </div>
  );
}
