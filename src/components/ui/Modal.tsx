import React from "react";
import { PreggaColors, PreggaShadows } from "../../theme/colors";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, width = 480, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(45, 42, 38, 0.5)",
        backdropFilter: "blur(2px)",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          background: PreggaColors.white,
          borderRadius: 16,
          boxShadow: PreggaShadows.modal,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              borderBottom: `1px solid ${PreggaColors.primary100}`,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                display: "flex",
                color: PreggaColors.neutral500,
                borderRadius: 6,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = PreggaColors.neutral100;
                e.currentTarget.style.color = PreggaColors.neutral700;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = PreggaColors.neutral500;
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div
          style={{
            padding: title ? "20px 24px" : "24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: `1px solid ${PreggaColors.primary100}`,
              background: PreggaColors.cream50,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
