import { useState, useRef, useEffect } from "react";
import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  size?: "sm" | "md" | "lg";
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
  hint,
  fullWidth = true,
  required,
  disabled,
  size = "md",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption?.label || placeholder;

  const sizes = {
    sm: { height: 36, padding: "8px 32px 8px 12px", fontSize: 13 },
    md: { height: 42, padding: "10px 36px 10px 14px", fontSize: 14 },
    lg: { height: 48, padding: "12px 40px 12px 16px", fontSize: 15 },
  };

  const sizeStyle = sizes[size];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          event.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case "Enter":
          event.preventDefault();
          if (highlightedIndex >= 0) {
            handleSelect(options[highlightedIndex].value);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, options]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div
      style={{ marginBottom: 0, width: fullWidth ? "100%" : "auto" }}
      ref={containerRef}
    >
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            color: PreggaColors.neutral700,
            marginBottom: 6,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {label}
          {required && (
            <span style={{ color: PreggaColors.error500, marginLeft: 2 }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            width: fullWidth ? "100%" : "auto",
            height: sizeStyle.height,
            padding: sizeStyle.padding,
            borderRadius: 8,
            border: `1px solid ${error ? PreggaColors.error400 : isOpen ? PreggaColors.accent400 : PreggaColors.neutral200}`,
            fontSize: sizeStyle.fontSize,
            fontFamily: "'Inter', -apple-system, sans-serif",
            outline: "none",
            transition: PreggaTransitions.normal,
            boxSizing: "border-box" as const,
            color: selectedOption ? PreggaColors.neutral900 : PreggaColors.neutral500,
            fontWeight: 400,
            background: PreggaColors.white,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            textAlign: "left" as const,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: isOpen ? PreggaShadows.focus : "none",
          }}
        >
          {selectedOption?.icon && (
            <span style={{ display: "flex", color: PreggaColors.neutral500 }}>
              {selectedOption.icon}
            </span>
          )}
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {displayText}
          </span>
        </button>
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
            color: isOpen ? PreggaColors.accent500 : PreggaColors.neutral400,
            display: "flex",
            pointerEvents: "none",
            transition: PreggaTransitions.fast,
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
              boxShadow: PreggaShadows.lg,
              zIndex: 1000,
              maxHeight: 280,
              overflowY: "auto",
              padding: 4,
              animation: "selectDropdown 0.15s ease-out",
            }}
          >
            <style>{`
              @keyframes selectDropdown {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            {options.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: "10px 12px",
                  fontSize: 14,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  color: PreggaColors.neutral900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background:
                    highlightedIndex === index
                      ? PreggaColors.neutral100
                      : option.value === value
                      ? PreggaColors.neutral50
                      : "transparent",
                  transition: PreggaTransitions.fast,
                  whiteSpace: "nowrap",
                  borderRadius: 6,
                }}
              >
                {option.icon && (
                  <span style={{ display: "flex", color: PreggaColors.neutral500 }}>
                    {option.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>{option.label}</span>
                {option.value === value && (
                  <Check size={16} color={PreggaColors.accent600} strokeWidth={2.5} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div
          style={{
            fontSize: 12,
            color: PreggaColors.error600,
            marginTop: 6,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {error}
        </div>
      )}
      {hint && !error && (
        <div
          style={{
            fontSize: 12,
            color: PreggaColors.neutral500,
            marginTop: 6,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
