import React, { useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  width?: number;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = 480,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [open, handleEscapeKey]);

  if (!open) return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const modalContent = (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        onClick={closeOnOverlayClick ? onClose : undefined}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          padding: isMobile ? 0 : 24,
          animation: "modalFadeIn 0.15s ease-out",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: isMobile ? "100%" : width,
            maxHeight: isMobile ? "90vh" : "85vh",
            background: PreggaColors.white,
            borderRadius: isMobile ? "16px 16px 0 0" : 12,
            boxShadow: PreggaShadows.modal,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: isMobile ? "modalSlideUp 0.25s ease-out" : "modalSlideIn 0.2s ease-out",
          }}
        >
          {showCloseButton && (
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
                borderRadius: 6,
                transition: PreggaTransitions.fast,
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
          )}

          {(title || description) && (
            <div
              style={{
                padding: "20px 24px",
                paddingRight: showCloseButton ? 56 : 24,
                borderBottom: `1px solid ${PreggaColors.neutral100}`,
              }}
            >
              {title && (
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: PreggaColors.neutral900,
                    margin: 0,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  style={{
                    fontSize: 14,
                    color: PreggaColors.neutral500,
                    margin: "6px 0 0",
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          )}

          <div
            style={{
              padding: title || description ? "20px 24px" : "24px",
              paddingTop: !title && !description && showCloseButton ? 48 : undefined,
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
                borderTop: `1px solid ${PreggaColors.neutral100}`,
                background: PreggaColors.neutral50,
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
