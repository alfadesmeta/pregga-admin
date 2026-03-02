import React, { useState } from "react";
import { PreggaColors } from "../../theme/colors";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
  fullWidth = true,
  required,
  disabled,
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  const selectStyle: React.CSSProperties = {
    width: fullWidth ? "100%" : "auto",
    padding: "10px 40px 10px 14px",
    borderRadius: 10,
    border: `1px solid ${error ? PreggaColors.destructive400 : isFocused ? PreggaColors.accent400 : PreggaColors.neutral200}`,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box" as const,
    color: value ? PreggaColors.neutral900 : PreggaColors.neutral400,
    background: PreggaColors.white,
    boxShadow: isFocused ? `0 0 0 3px ${PreggaColors.accent100}` : "none",
    cursor: disabled ? "not-allowed" : "pointer",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <div style={{ marginBottom: 16, width: fullWidth ? "100%" : "auto" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: PreggaColors.neutral700,
            marginBottom: 6,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {label}
          {required && <span style={{ color: PreggaColors.destructive500, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          style={selectStyle}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div
          style={{
            position: "absolute",
            right: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: PreggaColors.neutral400,
            display: "flex",
            pointerEvents: "none",
          }}
        >
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <div style={{ fontSize: 12, color: PreggaColors.destructive500, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
