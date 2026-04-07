import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input, Textarea } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import { fetchWeeklyContent, upsertWeeklyContent, deleteWeeklyContent } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { WeeklyContent } from "../../../types/database";
import { Plus, Pencil, Trash2, AlertCircle, BookOpen, Image } from "lucide-react";

interface WeeklyContentViewProps {
  isMobile: boolean;
}

export function WeeklyContentView({ isMobile }: WeeklyContentViewProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContent, setEditingContent] = useState<WeeklyContent | null>(null);

  const { data: content, isLoading, error, refetch } = useSupabaseQuery<WeeklyContent[]>(
    ['weekly-content'],
    fetchWeeklyContent
  );

  const handleSave = async (data: Partial<WeeklyContent> & { week_number: number }) => {
    try {
      await upsertWeeklyContent(data);
      toast.success(editingContent ? "Content updated" : "Content created");
      refetch();
      setShowEditModal(false);
      setEditingContent(null);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWeeklyContent(id);
      toast.success("Content deleted");
      refetch();
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <AlertCircle size={48} color={PreggaColors.error500} style={{ marginBottom: 16 }} />
        <h3 style={{ color: PreggaColors.neutral900, marginBottom: 8 }}>Failed to load content</h3>
        <Button onClick={refetch} style={{ marginTop: 16 }}>Try Again</Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: 0 }}>Weekly Content</h2>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "4px 0 0" }}>
            Manage pregnancy week-by-week educational content
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setEditingContent(null); setShowEditModal(true); }}>
          Add Week
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 40, textAlign: "center", color: PreggaColors.neutral400 }}>Loading...</div>
      ) : !content || content.length === 0 ? (
        <Card padding="60px">
          <div style={{ textAlign: "center", color: PreggaColors.neutral400 }}>
            <BookOpen size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>No weekly content yet. Add your first week!</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {content.map((item) => (
            <Card key={item.id} padding="16px">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: PreggaColors.primary600, background: PreggaColors.primary100, padding: "2px 8px", borderRadius: 4 }}>
                    Week {item.week_number}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setEditingContent(item); setShowEditModal(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral400, padding: 4 }}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.error400, padding: 4 }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {item.illustration_url && (
                  <div style={{ width: "100%", height: 120, borderRadius: 8, background: PreggaColors.neutral100, overflow: "hidden" }}>
                    <img src={item.illustration_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}

                {item.affirmation && (
                  <div style={{ fontSize: 14, fontWeight: 500, color: PreggaColors.neutral800, fontStyle: "italic" }}>
                    "{item.affirmation}"
                  </div>
                )}

                {item.baby_size_comparison && (
                  <div style={{ fontSize: 13, color: PreggaColors.neutral600 }}>
                    <strong>Baby size:</strong> {item.baby_size_comparison}
                  </div>
                )}

                {item.content_body && (
                  <div style={{ fontSize: 13, color: PreggaColors.neutral500, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                    {item.content_body}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ContentEditModal
        open={showEditModal}
        content={editingContent}
        onClose={() => { setShowEditModal(false); setEditingContent(null); }}
        onSave={handleSave}
      />
    </div>
  );
}

function ContentEditModal({ open, content, onClose, onSave }: { 
  open: boolean; 
  content: WeeklyContent | null; 
  onClose: () => void; 
  onSave: (data: Partial<WeeklyContent> & { week_number: number }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({ 
    week_number: 1, 
    affirmation: "", 
    content_body: "", 
    illustration_url: "", 
    baby_size_comparison: "" 
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(content ? {
        week_number: content.week_number,
        affirmation: content.affirmation || "",
        content_body: content.content_body || "",
        illustration_url: content.illustration_url || "",
        baby_size_comparison: content.baby_size_comparison || "",
      } : { week_number: 1, affirmation: "", content_body: "", illustration_url: "", baby_size_comparison: "" });
    }
  }, [open, content]);

  const handleSubmit = async () => {
    if (!formData.week_number) { toast.error("Week number is required"); return; }
    setSaving(true);
    try {
      await onSave({
        ...(content ? { id: content.id } : {}),
        week_number: formData.week_number,
        affirmation: formData.affirmation || null,
        content_body: formData.content_body || null,
        illustration_url: formData.illustration_url || null,
        baby_size_comparison: formData.baby_size_comparison || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={content ? "Edit Week Content" : "Add Week Content"} width={600} footer={
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} loading={saving}>Save</Button>
      </div>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input 
          label="Week Number" 
          type="number" 
          inputSize="md"
          value={String(formData.week_number)} 
          onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })} 
          required 
        />
        <Input 
          label="Affirmation" 
          value={formData.affirmation} 
          onChange={(e) => setFormData({ ...formData, affirmation: e.target.value })} 
          placeholder="A positive affirmation for this week"
        />
        <Input 
          label="Baby Size Comparison" 
          value={formData.baby_size_comparison} 
          onChange={(e) => setFormData({ ...formData, baby_size_comparison: e.target.value })} 
          placeholder="e.g., A lemon, An avocado"
        />
        <Input 
          label="Illustration URL" 
          value={formData.illustration_url} 
          onChange={(e) => setFormData({ ...formData, illustration_url: e.target.value })} 
          icon={<Image size={16} />} 
        />
        <Textarea 
          label="Content Body" 
          value={formData.content_body} 
          onChange={(e) => setFormData({ ...formData, content_body: e.target.value })} 
          style={{ minHeight: 120 }}
        />
      </div>
    </Modal>
  );
}

export default WeeklyContentView;
