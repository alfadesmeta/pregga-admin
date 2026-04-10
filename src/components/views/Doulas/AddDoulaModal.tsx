import React, { useState } from "react";
import toast from "react-hot-toast";
import { PreggaColors } from "../../../theme/colors";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Input, Textarea } from "../../ui/Input";
import { createDoula } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import { invalidateCache } from "../../../hooks";
import { UserPlus, Mail, Phone, Award, Check, X, Plus } from "lucide-react";

interface AddDoulaModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  displayName: string;
  email: string;
  phone: string;
  bio: string;
  yearsExperience: string;
  expertiseTags: string[];
}

const INITIAL_FORM: FormData = {
  displayName: "",
  email: "",
  phone: "",
  bio: "",
  yearsExperience: "",
  expertiseTags: [],
};

export function AddDoulaModal({ open, onClose }: AddDoulaModalProps) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setStep(1);
    setErrors({});
    setFormData(INITIAL_FORM);
    onClose();
  };

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!formData.displayName.trim()) e.displayName = "Name is required";
      if (!formData.email.trim()) e.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email format";
    }
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.displayName.trim() || !formData.email.trim()) {
      toast.error("Please fill all required fields");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      await createDoula({
        email: formData.email.trim().toLowerCase(),
        displayName: formData.displayName.trim(),
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        yearsExperience: formData.yearsExperience || undefined,
        expertise: formData.expertiseTags,
      });

      toast.success("Doula created successfully");
      invalidateCache("doulas");
      handleClose();
    } catch (err: unknown) {
      const msg = friendlyError(err);
      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
        setStep(1);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const stepLabels = ["Contact", "Professional", "Review"];

  return (
    <Modal open={open} onClose={handleClose} title="Add New Doula" width={520}>
      <div style={{ padding: "4px 0 0" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 }}>
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    background: step >= s ? PreggaColors.accent500 : PreggaColors.neutral100,
                    color: step >= s ? PreggaColors.white : PreggaColors.neutral400,
                    transition: "all 0.2s ease",
                  }}
                >
                  {step > s ? <Check size={16} /> : s}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: step >= s ? PreggaColors.accent700 : PreggaColors.neutral400,
                  }}
                >
                  {stepLabels[i]}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: 52,
                    height: 2,
                    background: step > s ? PreggaColors.accent500 : PreggaColors.neutral200,
                    transition: "all 0.2s",
                    marginBottom: 20,
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Contact Information
            </div>
            <Input
              label="Full Name"
              placeholder="e.g., Sarah Johnson"
              value={formData.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
              icon={<UserPlus size={16} />}
              required
            />
            {errors.displayName && <div style={{ fontSize: 13, color: PreggaColors.error500, marginTop: 6, marginBottom: 12, fontWeight: 500 }}>{errors.displayName}</div>}
            <Input
              label="Email Address"
              type="email"
              placeholder="sarah@example.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            {errors.email && <div style={{ fontSize: 13, color: PreggaColors.error500, marginTop: 6, marginBottom: 12, fontWeight: 500 }}>{errors.email}</div>}
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              icon={<Phone size={16} />}
            />
          </div>
        )}

        {/* Step 2: Professional Details */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900 }}>
              Professional Details
            </div>
            <Textarea
              label="Bio"
              placeholder="Brief professional background..."
              value={formData.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={3}
            />
            <Input
              label="Years of Experience"
              type="number"
              placeholder="e.g., 5"
              value={formData.yearsExperience}
              onChange={(e) => updateField("yearsExperience", e.target.value)}
              icon={<Award size={16} />}
            />
            <ExpertiseTagInput
              tags={formData.expertiseTags}
              onChange={(tags) => setFormData({ ...formData, expertiseTags: tags })}
            />
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: PreggaColors.neutral900, marginBottom: 16 }}>
              Review & Confirm
            </div>
            <div
              style={{
                background: PreggaColors.neutral50,
                borderRadius: 12,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <ReviewRow label="Name" value={formData.displayName} />
              <ReviewRow label="Email" value={formData.email} />
              {formData.phone && <ReviewRow label="Phone" value={formData.phone} />}
              {formData.bio && <ReviewRow label="Bio" value={formData.bio} />}
              {formData.yearsExperience && <ReviewRow label="Experience" value={`${formData.yearsExperience} years`} />}
              {formData.expertiseTags.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: PreggaColors.neutral500, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 6 }}>
                    Expertise
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {formData.expertiseTags.map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: "4px 10px",
                          borderRadius: 16,
                          background: PreggaColors.accent100,
                          color: PreggaColors.accent700,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, color: PreggaColors.neutral500, marginTop: 16, lineHeight: 1.5 }}>
              A temporary password will be generated. The doula can sign in with their email and reset their password.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTop: `1px solid ${PreggaColors.neutral100}` }}>
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>Back</Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Create Doula
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ExpertiseTagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const value = inputValue.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setInputValue("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: PreggaColors.neutral700, marginBottom: 6 }}>
        Expertise
      </label>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {tags.map((tag, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 500,
                padding: "5px 10px",
                borderRadius: 16,
                background: PreggaColors.accent100,
                color: PreggaColors.accent700,
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  color: PreggaColors.accent500,
                }}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter to add..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${PreggaColors.neutral200}`,
            fontSize: 14,
            fontFamily: "'Inter', -apple-system, sans-serif",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => { 
            e.currentTarget.style.borderColor = PreggaColors.accent400; 
            e.currentTarget.style.boxShadow = `0 0 0 3px ${PreggaColors.accent100}`;
          }}
          onBlur={(e) => { 
            e.currentTarget.style.borderColor = PreggaColors.neutral200; 
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          onClick={addTag}
          disabled={!inputValue.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${PreggaColors.neutral200}`,
            background: inputValue.trim() ? PreggaColors.accent500 : PreggaColors.neutral100,
            color: inputValue.trim() ? PreggaColors.white : PreggaColors.neutral400,
            cursor: inputValue.trim() ? "pointer" : "default",
            transition: "all 0.15s",
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      <div style={{ fontSize: 11, color: PreggaColors.neutral400, marginTop: 6 }}>
        Press Enter or click + to add. E.g. Labor support, Postpartum care, Breastfeeding
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: PreggaColors.neutral500, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: PreggaColors.neutral900, lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}
