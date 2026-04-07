import React, { useState } from "react";
import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import { X } from "lucide-react";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onClear?: () => void;
  showClear?: boolean;
  inputSize?: "sm" | "md" | "lg";
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  hint,
  icon,
  rightIcon,
  fullWidth = true,
  onClear,
  showClear = false,
  inputSize = "md",
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value && String(props.value).length > 0;

  const sizes = {
    sm: { height: 36, padding: "8px 12px", fontSize: 13 },
    md: { height: 42, padding: "10px 14px", fontSize: 14 },
    lg: { height: 48, padding: "12px 16px", fontSize: 15 },
  };

  const sizeStyle = sizes[inputSize];

  const inputStyle: React.CSSProperties = {
    width: fullWidth ? "100%" : "auto",
    padding: sizeStyle.padding,
    paddingLeft: icon ? 40 : sizeStyle.padding.split(" ")[1],
    paddingRight: (showClear && hasValue) || rightIcon ? 40 : sizeStyle.padding.split(" ")[1],
    borderRadius: 8,
    border: `1px solid ${error ? PreggaColors.error400 : isFocused ? PreggaColors.accent400 : PreggaColors.neutral200}`,
    fontSize: sizeStyle.fontSize,
    fontFamily: "'Inter', -apple-system, sans-serif",
    outline: "none",
    transition: PreggaTransitions.normal,
    boxSizing: "border-box",
    color: PreggaColors.neutral900,
    background: PreggaColors.white,
    boxShadow: isFocused
      ? error
        ? PreggaShadows.focusError
        : PreggaShadows.focus
      : "none",
    height: sizeStyle.height,
    ...style,
  };

  return (
    <div style={{ marginBottom: label ? 0 : 0, width: fullWidth ? "100%" : "auto" }}>
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
          {props.required && (
            <span style={{ color: PreggaColors.error500, marginLeft: 2 }}>*</span>
          )}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <div
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: isFocused ? PreggaColors.accent500 : PreggaColors.neutral400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              transition: PreggaTransitions.fast,
            }}
          >
            {icon}
          </div>
        )}
        <input
          {...props}
          style={inputStyle}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        {showClear && hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: PreggaColors.neutral100,
              border: "none",
              borderRadius: 4,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: PreggaColors.neutral500,
              padding: 0,
              transition: PreggaTransitions.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = PreggaColors.neutral200;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = PreggaColors.neutral100;
            }}
          >
            <X size={12} />
          </button>
        )}
        {rightIcon && !showClear && (
          <div
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: PreggaColors.neutral400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {rightIcon}
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

export function Textarea({
  label,
  error,
  hint,
  fullWidth = true,
  style,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const textareaStyle: React.CSSProperties = {
    width: fullWidth ? "100%" : "auto",
    padding: "12px 14px",
    borderRadius: 8,
    border: `1px solid ${error ? PreggaColors.error400 : isFocused ? PreggaColors.accent400 : PreggaColors.neutral200}`,
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, sans-serif",
    outline: "none",
    transition: PreggaTransitions.normal,
    boxSizing: "border-box",
    color: PreggaColors.neutral900,
    background: PreggaColors.white,
    boxShadow: isFocused
      ? error
        ? PreggaShadows.focusError
        : PreggaShadows.focus
      : "none",
    resize: "vertical",
    minHeight: 100,
    lineHeight: 1.5,
    ...style,
  };

  return (
    <div style={{ marginBottom: 0, width: fullWidth ? "100%" : "auto" }}>
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
          {props.required && (
            <span style={{ color: PreggaColors.error500, marginLeft: 2 }}>*</span>
          )}
        </label>
      )}
      <textarea
        {...props}
        style={textareaStyle}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />
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
