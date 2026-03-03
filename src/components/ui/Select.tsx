import { useState, useRef, useEffect } from "react";
import { PreggaColors } from "../../theme/colors";
import { ChevronDown, Check } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || (value === "" && options[0]?.label) || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div style={{ marginBottom: label ? 16 : 0, width: fullWidth ? "100%" : "auto" }} ref={containerRef}>
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
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            width: fullWidth ? "100%" : "auto",
            height: 42,
            padding: "0 36px 0 14px",
            borderRadius: 8,
            border: `1px solid ${error ? PreggaColors.destructive400 : isOpen ? PreggaColors.neutral400 : PreggaColors.neutral200}`,
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
            outline: "none",
            transition: "border-color 0.15s",
            boxSizing: "border-box" as const,
            color: isOpen ? PreggaColors.neutral900 : (selectedOption ? PreggaColors.neutral700 : PreggaColors.neutral500),
            fontWeight: isOpen ? 500 : 400,
            background: PreggaColors.white,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
            textAlign: "left" as const,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayText}
          </span>
        </button>
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
            color: isOpen ? PreggaColors.neutral700 : PreggaColors.neutral400,
            display: "flex",
            pointerEvents: "none",
            transition: "transform 0.2s ease",
          }}
        >
          <ChevronDown size={16} />
        </div>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              minWidth: "100%",
              background: PreggaColors.white,
              borderRadius: 8,
              border: `1px solid ${PreggaColors.neutral200}`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
              maxHeight: 240,
              overflowY: "auto",
              padding: "4px 0",
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  color: PreggaColors.neutral900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  background: option.value === value ? PreggaColors.neutral50 : "transparent",
                  transition: "background 0.1s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = PreggaColors.neutral50;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = option.value === value ? PreggaColors.neutral50 : "transparent";
                }}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check size={16} color={PreggaColors.neutral700} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: PreggaColors.destructive500, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
