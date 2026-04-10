import { useState, useEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { useSupabaseQuery } from "../../../hooks";
import { PreggaColors } from "../../../theme/colors";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input, Textarea } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import { fetchWeeklyContent, upsertWeeklyContent, deleteWeeklyContent, uploadWeeklyContentImage } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import type { WeeklyContent } from "../../../types/database";
import { Plus, Pencil, Trash2, AlertCircle, BookOpen, Upload, X, Search } from "lucide-react";

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out", animation: "modalFadeIn 0.15s ease-out",
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 20, right: 20,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", border: "none",
          color: "#fff", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw", maxHeight: "90vh",
          borderRadius: 12, objectFit: "contain",
          cursor: "default",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      />
    </div>,
    document.body
  );
}

interface WeeklyContentViewProps {
  isMobile: boolean;
}

export function WeeklyContentView({ isMobile }: WeeklyContentViewProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContent, setEditingContent] = useState<WeeklyContent | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingContent, setDeletingContent] = useState<WeeklyContent | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: content, isLoading, error, refetch } = useSupabaseQuery<WeeklyContent[]>(
    ['weekly-content'],
    fetchWeeklyContent
  );

  const existingWeeks = useMemo(() => content?.map((c) => c.week_number) || [], [content]);

  const filteredContent = content?.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.week_number.toString().includes(query) ||
      item.affirmation?.toLowerCase().includes(query) ||
      item.baby_size_comparison?.toLowerCase().includes(query) ||
      item.content_body?.toLowerCase().includes(query)
    );
  });

  const handleSave = async (data: Partial<WeeklyContent> & { week_number: number }, pendingFile: File | null) => {
    try {
      let illustrationUrl = data.illustration_url;

      if (pendingFile) {
        toast.loading("Uploading image...", { id: "upload" });
        try {
          illustrationUrl = await uploadWeeklyContentImage(data.week_number, pendingFile);
          toast.success("Image uploaded", { id: "upload" });
        } catch (uploadErr) {
          toast.error(`Image upload failed: ${friendlyError(uploadErr)}`, { id: "upload" });
          throw uploadErr;
        }
      }

      await upsertWeeklyContent({ ...data, illustration_url: illustrationUrl });
      toast.success(editingContent ? "Content updated" : "Content created");
      refetch();
      setShowEditModal(false);
      setEditingContent(null);
    } catch (err) {
      toast.error(friendlyError(err));
    }
  };

  const handleDeleteClick = (item: WeeklyContent) => {
    setDeletingContent(item);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContent || deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);
    try {
      await deleteWeeklyContent(deletingContent.id);
      toast.success("Content deleted");
      refetch();
      setShowDeleteModal(false);
      setDeletingContent(null);
      setDeleteConfirmText("");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setIsDeleting(false);
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
      {/* Header with search and add button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 1 320px" }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: 12, 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: PreggaColors.neutral400 
            }} 
          />
          <input
            type="text"
            placeholder="Search by week, affirmation, baby size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              fontSize: 14,
              border: `1px solid ${PreggaColors.neutral200}`,
              borderRadius: 8,
              outline: "none",
              background: PreggaColors.white,
              color: PreggaColors.neutral900,
              fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = PreggaColors.primary400}
            onBlur={(e) => e.currentTarget.style.borderColor = PreggaColors.neutral200}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: PreggaColors.neutral400,
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          )}
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
      ) : filteredContent && filteredContent.length === 0 ? (
        <Card padding="60px">
          <div style={{ textAlign: "center", color: PreggaColors.neutral400 }}>
            <Search size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>No content matches "{searchQuery}"</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filteredContent?.map((item) => (
            <Card key={item.id} padding="16px">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: PreggaColors.primary600, background: PreggaColors.primary100, padding: "2px 8px", borderRadius: 4 }}>
                    Week {item.week_number}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button 
                      onClick={() => { setEditingContent(item); setShowEditModal(true); }} 
                      style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.neutral400, padding: 4, borderRadius: 4, transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = PreggaColors.neutral100}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item)} 
                      style={{ background: "none", border: "none", cursor: "pointer", color: PreggaColors.error400, padding: 4, borderRadius: 4, transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = PreggaColors.error50}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {item.illustration_url && (
                  <div 
                    onClick={() => setLightboxSrc(item.illustration_url!)}
                    style={{ width: "100%", height: 120, borderRadius: 8, background: PreggaColors.neutral100, overflow: "hidden", cursor: "zoom-in" }}
                  >
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
        existingWeeks={existingWeeks}
        onClose={() => { setShowEditModal(false); setEditingContent(null); }}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeletingContent(null); setDeleteConfirmText(""); }}
        title=""
        width={420}
        footer={
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeletingContent(null); setDeleteConfirmText(""); }}>Cancel</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              loading={isDeleting} 
              disabled={deleteConfirmText !== "DELETE"}
              style={{ 
                background: PreggaColors.error500,
                opacity: deleteConfirmText === "DELETE" ? 1 : 0.5,
                cursor: deleteConfirmText === "DELETE" ? "pointer" : "not-allowed",
              }}
            >
              Delete Content
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: PreggaColors.error50, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Trash2 size={28} color={PreggaColors.error500} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: PreggaColors.neutral900, margin: "0 0 8px" }}>Delete Week {deletingContent?.week_number} Content?</h3>
          <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: "0 0 20px", lineHeight: 1.5 }}>
            This will permanently delete the content for Week {deletingContent?.week_number}. This action cannot be undone.
          </p>
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 8 }}>
              Type <span style={{ fontFamily: "monospace", background: PreggaColors.neutral100, padding: "2px 6px", borderRadius: 4, color: PreggaColors.error600 }}>DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
              placeholder="DELETE"
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: 14,
                border: `1px solid ${deleteConfirmText === "DELETE" ? PreggaColors.error400 : PreggaColors.neutral200}`,
                borderRadius: 8,
                outline: "none",
                fontFamily: "monospace",
                letterSpacing: "1px",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = PreggaColors.error400}
              onBlur={(e) => e.currentTarget.style.borderColor = deleteConfirmText === "DELETE" ? PreggaColors.error400 : PreggaColors.neutral200}
            />
          </div>
        </div>
      </Modal>

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}

interface ContentEditModalProps {
  open: boolean;
  content: WeeklyContent | null;
  existingWeeks: number[];
  onClose: () => void;
  onSave: (data: Partial<WeeklyContent> & { week_number: number }, pendingFile: File | null) => Promise<void>;
}

const MAX_WEEK = 42;

function ContentEditModal({ open, content, existingWeeks, onClose, onSave }: ContentEditModalProps) {
  const [formData, setFormData] = useState({ 
    week_number: 1, 
    affirmation: "", 
    content_body: "", 
    illustration_url: "", 
    baby_size_comparison: "" 
  });
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!content;
  const availableWeeks = Array.from({ length: MAX_WEEK }, (_, i) => i + 1).filter(
    (w) => !existingWeeks.includes(w) || (content && content.week_number === w)
  );

  const existingWeeksRef = useRef(existingWeeks);
  existingWeeksRef.current = existingWeeks;

  useEffect(() => {
    if (open) {
      const weeks = existingWeeksRef.current;
      const firstAvailable = Array.from({ length: MAX_WEEK }, (_, i) => i + 1).find(
        (w) => !weeks.includes(w)
      ) || 1;
      const initialWeek = content?.week_number ?? firstAvailable;
      const initialData = content ? {
        week_number: content.week_number,
        affirmation: content.affirmation || "",
        content_body: content.content_body || "",
        illustration_url: content.illustration_url || "",
        baby_size_comparison: content.baby_size_comparison || "",
      } : { week_number: initialWeek, affirmation: "", content_body: "", illustration_url: "", baby_size_comparison: "" };
      
      setFormData(initialData);
      setImagePreview(initialData.illustration_url || null);
      setPendingFile(null);
    }
  }, [open, content]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, illustration_url: "" }));
    setImagePreview(null);
    setPendingFile(null);
  };

  const handleSubmit = async () => {
    if (!formData.week_number) { toast.error("Week number is required"); return; }
    if (!isEditing && existingWeeks.includes(formData.week_number)) {
      toast.error(`Week ${formData.week_number} already has content. Please select another week.`);
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...(content ? { id: content.id } : {}),
        week_number: formData.week_number,
        affirmation: formData.affirmation || null,
        content_body: formData.content_body || null,
        illustration_url: pendingFile ? "" : (formData.illustration_url || null),
        baby_size_comparison: formData.baby_size_comparison || null,
      }, pendingFile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Week Content" : "Add Week Content"} width={600} footer={
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} loading={saving}>{saving ? "Saving..." : "Save"}</Button>
      </div>
    }>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 8 }}>
            Week Number <span style={{ color: PreggaColors.error500 }}>*</span>
          </label>
          {isEditing ? (
            <div style={{
              padding: "10px 14px",
              background: PreggaColors.neutral100,
              borderRadius: 8,
              fontSize: 14,
              color: PreggaColors.neutral700,
              fontWeight: 500,
            }}>
              Week {formData.week_number}
              <span style={{ fontSize: 12, color: PreggaColors.neutral500, marginLeft: 8 }}>(cannot change when editing)</span>
            </div>
          ) : (
            <>
              <select
                value={formData.week_number}
                onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: 14,
                  border: `1px solid ${PreggaColors.neutral200}`,
                  borderRadius: 8,
                  outline: "none",
                  background: PreggaColors.white,
                  color: PreggaColors.neutral900,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                }}
              >
                {availableWeeks.length === 0 ? (
                  <option value="">All weeks have content</option>
                ) : (
                  availableWeeks.map((w) => (
                    <option key={w} value={w}>Week {w}</option>
                  ))
                )}
              </select>
              {availableWeeks.length === 0 && (
                <div style={{ marginTop: 8, fontSize: 13, color: PreggaColors.warning600, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={14} />
                  All 42 weeks have content. Edit an existing week instead.
                </div>
              )}
              {availableWeeks.length > 0 && existingWeeks.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: PreggaColors.neutral500 }}>
                  {existingWeeks.length} of {MAX_WEEK} weeks already have content
                </div>
              )}
            </>
          )}
        </div>

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
        
        <div>
          <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 8 }}>
            Illustration
          </label>
          
          {imagePreview ? (
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: `1px solid ${PreggaColors.neutral200}` }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} 
              />
              <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleFileSelect}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: PreggaColors.white, color: PreggaColors.neutral600,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <Upload size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: PreggaColors.error500, color: PreggaColors.white,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              {pendingFile && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  padding: "6px 12px", background: "rgba(0,0,0,0.6)",
                  fontSize: 12, color: PreggaColors.white,
                }}>
                  New image selected — will upload on Save
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={handleFileSelect}
              style={{
                border: `2px dashed ${PreggaColors.neutral300}`,
                borderRadius: 12, padding: "32px 24px", textAlign: "center",
                cursor: "pointer", transition: "all 0.15s ease", background: PreggaColors.neutral50,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = PreggaColors.primary400;
                e.currentTarget.style.background = PreggaColors.primary50;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = PreggaColors.neutral300;
                e.currentTarget.style.background = PreggaColors.neutral50;
              }}
            >
              <Upload size={32} color={PreggaColors.neutral400} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 4 }}>
                Click to select image
              </div>
              <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                PNG, JPG, GIF up to 5MB
              </div>
            </div>
          )}
          
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>

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
