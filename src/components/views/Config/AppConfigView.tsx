import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input, Textarea } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import { fetchAppConfig, updateAppConfig, deleteAppConfig } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { AppConfig } from "../../../types/database";
import { Plus, Settings, Pencil, Trash2, AlertCircle, Save } from "lucide-react";

interface AppConfigViewProps {
  isMobile: boolean;
}

export function AppConfigView({ isMobile }: AppConfigViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);

  const { data: configs, isLoading, error, refetch } = useSupabaseQuery<AppConfig[]>(['app-config'], fetchAppConfig);

  const handleSave = async (key: string, value: string) => {
    try {
      await updateAppConfig(key, value);
      toast.success("Config saved");
      refetch();
      setShowAddModal(false);
      setEditingConfig(null);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteAppConfig(key);
      toast.success("Config deleted");
      refetch();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load config</h3>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>App Configuration</h2>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "4px 0 0" }}>Manage app settings and feature flags</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Add Config</Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: "center", color: PreggaColors.neutral400 }}>Loading...</div>
      ) : !configs || configs.length === 0 ? (
        <Card padding="60px">
          <div style={{ textAlign: "center", color: PreggaColors.neutral400 }}>
            <Settings size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>No configuration options yet. Add your first config!</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          {configs.map((config) => (
            <ConfigCard key={config.id} config={config} onEdit={() => setEditingConfig(config)} onDelete={() => handleDelete(config.key)} />
          ))}
        </div>
      )}

      <ConfigModal open={showAddModal || !!editingConfig} config={editingConfig} onClose={() => { setShowAddModal(false); setEditingConfig(null); }} onSave={handleSave} />
    </div>
  );
}

function ConfigCard({ config, onEdit, onDelete }: { config: AppConfig; onEdit: () => void; onDelete: () => void }) {
  const valueStr = typeof config.value === 'object' ? JSON.stringify(config.value, null, 2) : String(config.value || '');
  const isBoolean = valueStr === "true" || valueStr === "false";
  const isReadonly = config.key.includes("api_key") || config.key.includes("secret");
  const isJson = typeof config.value === 'object' || (valueStr.startsWith('{') || valueStr.startsWith('['));

  return (
    <Card padding="20px">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: PreggaColors.primary600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{config.key}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {!isReadonly && (
            <>
              <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral400, padding: 4 }}><Pencil size={16} /></button>
              <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.error400, padding: 4 }}><Trash2 size={16} /></button>
            </>
          )}
        </div>
      </div>
      {isBoolean ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: valueStr === "true" ? PreggaColors.success500 : PreggaColors.neutral300 }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: valueStr === "true" ? PreggaColors.success600 : PreggaColors.neutral500 }}>
            {valueStr === "true" ? "Enabled" : "Disabled"}
          </span>
        </div>
      ) : isJson ? (
        <pre style={{ fontSize: 12, color: PreggaColors.neutral700, background: PreggaColors.neutral50, padding: 12, borderRadius: 8, margin: 0, overflow: "auto", maxHeight: 150 }}>
          {valueStr}
        </pre>
      ) : (
        <div style={{ fontSize: 14, color: PreggaColors.neutral700, wordBreak: "break-all" }}>
          {isReadonly ? "••••••••••" : valueStr}
        </div>
      )}
    </Card>
  );
}

function ConfigModal({ open, config, onClose, onSave }: { open: boolean; config: AppConfig | null; onClose: () => void; onSave: (key: string, value: string) => Promise<void> }) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setKey(config?.key || "");
      const val = config?.value;
      setValue(typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val || ""));
    }
  }, [open, config]);

  const handleSubmit = async () => {
    if (!key || !value) { toast.error("Key and value are required"); return; }
    setSaving(true);
    try {
      await onSave(key, value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={config ? "Edit Config" : "Add Config"} width={480} footer={
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={saving} icon={<Save size={16} />}>Save</Button>
      </div>
    }>
      <Input label="Key" value={key} onChange={(e) => setKey(e.target.value.toLowerCase().replace(/\s/g, "_"))} placeholder="e.g., maintenance_mode" disabled={!!config} required />
      <div style={{ marginTop: 16 }}>
        <Textarea label="Value" value={value} onChange={(e) => setValue(e.target.value)} placeholder='e.g., true, 1.0.0, or {"key": "value"}' style={{ minHeight: 100, fontFamily: "monospace" }} required />
      </div>
      <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
        Use "true" or "false" for booleans. JSON objects are supported.
      </div>
    </Modal>
  );
}

export default AppConfigView;
