import { useState } from "react";
import toast from "react-hot-toast";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { supabase } from "../../../lib/supabase";
import { updateAdminProfile, uploadAvatar } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { Profile } from "../../../types/database";
import type { User } from "@supabase/supabase-js";
import { User as UserIcon, Lock, Camera, Eye, EyeOff, Check } from "lucide-react";

interface SettingsViewProps {
  isMobile: boolean;
  user: User;
  profile: Profile;
}

export function SettingsView({ isMobile, profile }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 0, background: PreggaColors.white, borderRadius: 12, padding: 4, border: `1px solid ${PreggaColors.secondary300}` }}>
        {[{ id: "profile", label: "Profile", icon: <UserIcon size={14} /> }, { id: "password", label: "Password", icon: <Lock size={14} /> }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} style={{ flex: 1, padding: "12px 20px", borderRadius: 8, border: activeTab === tab.id ? `1px solid ${PreggaColors.secondary300}` : "1px solid transparent", background: activeTab === tab.id ? PreggaColors.secondary100 : "transparent", color: activeTab === tab.id ? PreggaColors.neutral900 : PreggaColors.neutral500, fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileTab profile={profile} isMobile={isMobile} />}
      {activeTab === "password" && <PasswordTab />}
    </div>
  );
}

function ProfileTab({ profile, isMobile }: { profile: Profile; isMobile: boolean }) {
  const [formData, setFormData] = useState({ display_name: profile.display_name || "", email: profile.email || "", phone: profile.phone || "" });
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAdminProfile(profile.id, { display_name: formData.display_name, email: formData.email, phone: formData.phone });
      toast.success("Profile updated");
    } catch (err) { toast.error(friendlyError(err)); } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadAvatar(profile.id, file);
      setAvatarUrl(url);
      toast.success("Avatar updated");
    } catch (err) { toast.error(friendlyError(err)); }
  };

  return (
    <Card padding="24px">
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: PreggaColors.primary100, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.primary600, fontSize: 24, fontWeight: 600, overflow: "hidden" }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (profile.display_name || "A").split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <label style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: PreggaColors.primary500, display: "flex", alignItems: "center", justifyContent: "center", color: PreggaColors.white, cursor: "pointer", border: "2px solid white" }}>
            <Camera size={14} />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
          </label>
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900 }}>{profile.display_name || "Admin"}</div>
          <div style={{ fontSize: 13, color: PreggaColors.neutral500 }}>{profile.email}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <Input label="Name" value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} />
        <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
      </div>

      <div style={{ marginTop: 20 }}>
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>
    </Card>
  );
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  const passwordRequirements = [
    { met: newPassword.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(newPassword), text: "One uppercase letter" },
    { met: /[a-z]/.test(newPassword), text: "One lowercase letter" },
    { met: /[0-9]/.test(newPassword), text: "One number" },
  ];

  const allRequirementsMet = passwordRequirements.every(r => r.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async () => {
    if (!allRequirementsMet) { toast.error("Please meet all password requirements"); return; }
    if (!passwordsMatch) { toast.error("Passwords do not match"); return; }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) { toast.error(friendlyError(err)); } finally { setSaving(false); }
  };

  return (
    <Card padding="24px">
      <h3 style={{ fontSize: 16, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 20px" }}>Change Password</h3>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <Input label="Current Password" type={showPasswords.current ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })} style={{ position: "absolute", right: 14, top: 36, background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral400 }}>
          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <Input label="New Password" type={showPasswords.new ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })} style={{ position: "absolute", right: 14, top: 36, background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral400 }}>
          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div style={{ marginBottom: 16, padding: 16, background: PreggaColors.neutral50, borderRadius: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: PreggaColors.neutral600, marginBottom: 8 }}>Password Requirements</div>
        {passwordRequirements.map((req, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 13, color: req.met ? PreggaColors.success600 : PreggaColors.neutral500 }}>
            <Check size={14} style={{ opacity: req.met ? 1 : 0.3 }} />
            {req.text}
          </div>
        ))}
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <Input label="Confirm New Password" type={showPasswords.confirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={confirmPassword && !passwordsMatch ? "Passwords do not match" : undefined} required />
        <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })} style={{ position: "absolute", right: 14, top: 36, background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral400 }}>
          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <Button onClick={handleSubmit} loading={saving} disabled={!allRequirementsMet || !passwordsMatch}>Update Password</Button>
    </Card>
  );
}

export default SettingsView;
