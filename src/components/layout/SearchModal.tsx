import React, { useState, useEffect, useRef } from "react";
import { PreggaColors, PreggaShadows } from "../../theme/colors";
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  Heart, 
  MessageCircle, 
  Radio, 
  CreditCard, 
  FileText, 
  Settings,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  icon: React.ReactNode;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (result: SearchResult) => void;
  results?: SearchResult[];
}

export function SearchModal({ open, onClose, onSelect, results = [] }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  const filteredResults = results.filter(
    (r) =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.subtitle?.toLowerCase().includes(query.toLowerCase())
  );

  const defaultResults: SearchResult[] = [
    { id: "dashboard", title: "Dashboard", subtitle: "Overview and statistics", type: "page", icon: <LayoutDashboard size={16} /> },
    { id: "users", title: "Users", subtitle: "Manage pregnant users", type: "page", icon: <Users size={16} /> },
    { id: "doulas", title: "Doulas", subtitle: "Manage doula profiles", type: "page", icon: <Heart size={16} /> },
    { id: "subscriptions", title: "Subscriptions", subtitle: "Manage user subscriptions", type: "page", icon: <CreditCard size={16} /> },
    { id: "conversations", title: "Conversations", subtitle: "View chat conversations", type: "page", icon: <MessageCircle size={16} /> },
    { id: "broadcasts", title: "Broadcasts", subtitle: "Broadcast requests", type: "page", icon: <Radio size={16} /> },
    { id: "weekly-content", title: "Weekly Content", subtitle: "Manage pregnancy content", type: "page", icon: <FileText size={16} /> },
    { id: "settings", title: "Settings", subtitle: "Admin profile settings", type: "page", icon: <Settings size={16} /> },
  ];

  const displayResults = query ? filteredResults : defaultResults;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 100,
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 560,
          maxWidth: "90vw",
          background: PreggaColors.white,
          borderRadius: 16,
          boxShadow: PreggaShadows.modal,
          overflow: "hidden",
          animation: "modalIn 0.15s ease-out",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.96) translateY(-8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: `1px solid ${PreggaColors.secondary300}`,
          }}
        >
          <Search size={18} style={{ color: PreggaColors.neutral500 }} />
          <input
            ref={inputRef}
            type="text"
            aria-label="Navigate to a section"
            placeholder="Navigate to a section..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 15,
              fontFamily: "inherit",
              color: PreggaColors.neutral900,
              background: "transparent",
            }}
          />
          <span
            style={{
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 4,
              background: PreggaColors.neutral100,
              color: PreggaColors.neutral500,
            }}
          >
            ESC
          </span>
        </div>

        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {displayResults.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: PreggaColors.neutral500,
                fontSize: 14,
              }}
            >
              No results found for "{query}"
            </div>
          ) : (
            displayResults.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  onSelect?.(result);
                  onClose();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.accent50)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: PreggaColors.accent100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: PreggaColors.accent700,
                  }}
                >
                  {result.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: PreggaColors.neutral900 }}>
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>{result.subtitle}</div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: PreggaColors.neutral100,
                    color: PreggaColors.neutral500,
                    textTransform: "capitalize",
                  }}
                >
                  {result.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
