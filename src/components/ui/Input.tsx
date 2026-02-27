import React, { useState } from "react";
import { PreggaColors } from "../../theme/colors";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  icon,
  fullWidth = true,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: fullWidth ? "100%" : "auto",
    padding: icon ? "10px 14px 10px 40px" : "10px 14px",
    borderRadius: 10,
    border: `1px solid ${error ? PreggaColors.destructive400 : isFocused ? PreggaColors.primary400 : PreggaColors.primary200}`,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
    color: PreggaColors.neutral900,
    background: PreggaColors.white,
    boxShadow: isFocused ? `0 0 0 3px ${PreggaColors.primary100}` : "none",
    ...style,
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
          {props.required && <span style={{ color: PreggaColors.destructive500, marginLeft: 2 }}>*</span>}
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
              color: PreggaColors.neutral400,
              display: "flex",
              pointerEvents: "none",
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
      </div>
      {error && (
        <div style={{ fontSize: 12, color: PreggaColors.destructive500, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  fullWidth = true,
  style,
  ...props
}: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);

  const textareaStyle: React.CSSProperties = {
    width: fullWidth ? "100%" : "auto",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${error ? PreggaColors.destructive400 : isFocused ? PreggaColors.primary400 : PreggaColors.primary200}`,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
    color: PreggaColors.neutral900,
    background: PreggaColors.white,
    boxShadow: isFocused ? `0 0 0 3px ${PreggaColors.primary100}` : "none",
    resize: "vertical",
    minHeight: 100,
    ...style,
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
          {props.required && <span style={{ color: PreggaColors.destructive500, marginLeft: 2 }}>*</span>}
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
        <div style={{ fontSize: 12, color: PreggaColors.destructive500, marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
