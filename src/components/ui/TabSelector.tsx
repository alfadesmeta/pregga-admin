import React, { useState, useRef, useEffect } from "react";
import { PreggaColors, PreggaShadows } from "../../theme/colors";
import { ChevronDown, Check } from "lucide-react";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobile: boolean;
}

export function TabSelector({ tabs, activeTab, onTabChange, isMobile }: TabSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTabData = tabs.find((t) => t.id === activeTab);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  if (isMobile) {
    return (
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: PreggaColors.white,
            border: `1px solid ${dropdownOpen ? PreggaColors.sage400 : PreggaColors.secondary300}`,
            borderRadius: 12,
            cursor: "pointer",
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: PreggaColors.neutral900,
            boxShadow: dropdownOpen ? `0 0 0 3px ${PreggaColors.sage100}` : PreggaShadows.sm,
            transition: "all 0.15s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {activeTabData?.icon && (
              <span style={{ color: PreggaColors.sage600, display: "flex" }}>
                {activeTabData.icon}
              </span>
            )}
            {activeTabData?.label || "Select"}
          </div>
          <ChevronDown
            size={18}
            style={{
              color: PreggaColors.neutral500,
              transition: "transform 0.2s ease",
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: PreggaColors.white,
              border: `1px solid ${PreggaColors.secondary300}`,
              borderRadius: 12,
              boxShadow: PreggaShadows.lg,
              zIndex: 100,
              overflow: "hidden",
              animation: "dropdownIn 0.15s ease-out",
            }}
          >
            <style>{`
              @keyframes dropdownIn {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: isActive ? PreggaColors.sage50 : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? PreggaColors.sage700 : PreggaColors.neutral700,
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = PreggaColors.neutral50;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {tab.icon && (
                      <span
                        style={{
                          color: isActive ? PreggaColors.sage600 : PreggaColors.neutral500,
                          display: "flex",
                        }}
                      >
                        {tab.icon}
                      </span>
                    )}
                    {tab.label}
                  </div>
                  {isActive && <Check size={16} style={{ color: PreggaColors.sage600 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        background: PreggaColors.white,
        borderRadius: 12,
        padding: 6,
        boxShadow: PreggaShadows.sm,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              padding: "11px 16px",
              border: isActive ? `1px solid ${PreggaColors.secondary300}` : "1px solid transparent",
              borderRadius: 8,
              background: isActive ? PreggaColors.secondary100 : "transparent",
              cursor: "pointer",
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: isActive ? PreggaColors.neutral900 : PreggaColors.neutral500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = PreggaColors.neutral50;
                e.currentTarget.style.color = PreggaColors.neutral700;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = PreggaColors.neutral500;
              }
            }}
          >
            {tab.icon && (
              <span style={{ display: "flex", color: isActive ? PreggaColors.sage600 : "inherit" }}>
                {tab.icon}
              </span>
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
