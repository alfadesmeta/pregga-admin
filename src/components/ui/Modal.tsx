import React from "react";
import ReactDOM from "react-dom";
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        background: "rgba(45, 42, 38, 0.6)",
        backdropFilter: "blur(4px)",
        padding: isMobile ? 0 : 20,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isMobile ? "100%" : width,
          maxHeight: isMobile ? "85vh" : "90vh",
          background: PreggaColors.white,
          borderRadius: isMobile ? "16px 16px 0 0" : 16,
          boxShadow: PreggaShadows.modal,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - always visible */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: PreggaColors.neutral100,
            border: "none",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            color: PreggaColors.neutral500,
            borderRadius: 8,
            transition: "all 0.15s",
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PreggaColors.neutral200;
            e.currentTarget.style.color = PreggaColors.neutral700;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PreggaColors.neutral100;
            e.currentTarget.style.color = PreggaColors.neutral500;
          }}
        >
          <X size={18} />
        </button>

        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 24px",
              paddingRight: 56,
              borderBottom: `1px solid ${PreggaColors.primary100}`,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {title}
            </h2>
          </div>
        )}
        <div
          style={{
            padding: title ? "20px 24px" : "24px",
            paddingTop: title ? 20 : 48,
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

  // Render modal in a portal to ensure it's outside the page content
  return ReactDOM.createPortal(modalContent, document.body);
}
