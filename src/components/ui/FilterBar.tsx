import React, { useState } from "react";
import { PreggaColors } from "../../theme/colors";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface FilterBarProps {
  isMobile: boolean;
  search: React.ReactNode;
  filters: React.ReactNode;
  actions?: React.ReactNode;
  activeFilterCount: number;
  onClearFilters?: () => void;
}

export function FilterBar({
  isMobile,
  search,
  filters,
  actions,
  activeFilterCount,
  onClearFilters,
}: FilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!isMobile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 16,
          gap: 10,
        }}
      >
        <div style={{ marginBottom: -16 }}>{search}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: -16 }}>{filters}</div>
        {activeFilterCount > 0 && onClearFilters && (
          <button
            onClick={onClearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: PreggaColors.neutral100,
              color: PreggaColors.neutral700,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.neutral200)}
            onMouseLeave={(e) => (e.currentTarget.style.background = PreggaColors.neutral100)}
          >
            <X size={14} />
            Clear
          </button>
        )}
        {actions && <div style={{ marginLeft: "auto" }}>{actions}</div>}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, marginBottom: -16 }}>{search}</div>
        {actions}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${filtersOpen ? PreggaColors.sage500 : PreggaColors.secondary300}`,
            background: filtersOpen ? PreggaColors.sage50 : PreggaColors.white,
            color: filtersOpen ? PreggaColors.sage700 : PreggaColors.neutral700,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                background: PreggaColors.sage600,
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 5px",
              }}
            >
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            size={14}
            style={{
              transition: "transform 0.15s",
              transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </button>

        {activeFilterCount > 0 && onClearFilters && (
          <button
            onClick={() => {
              onClearFilters();
              setFiltersOpen(false);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: PreggaColors.neutral500,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {filtersOpen && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: PreggaColors.white,
            borderRadius: 10,
            border: `1px solid ${PreggaColors.secondary300}`,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {filters}
        </div>
      )}
    </div>
  );
}
