import React from "react";
import { PreggaColors, PreggaTransitions } from "../../theme/colors";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isMobile?: boolean;
  showFirstLast?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isMobile = false,
  showFirstLast = false,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const buttonBase: React.CSSProperties = {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    border: `1px solid ${PreggaColors.neutral200}`,
    background: PreggaColors.white,
    cursor: "pointer",
    color: PreggaColors.neutral600,
    transition: PreggaTransitions.fast,
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  const buttonHover = {
    background: PreggaColors.neutral50,
    borderColor: PreggaColors.neutral300,
  };

  const buttonDisabled: React.CSSProperties = {
    ...buttonBase,
    opacity: 0.4,
    cursor: "not-allowed",
  };

  const buttonActive: React.CSSProperties = {
    ...buttonBase,
    background: PreggaColors.accent500,
    color: PreggaColors.white,
    borderColor: PreggaColors.accent500,
    fontWeight: 600,
  };

  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
          {startItem}–{endItem} of {totalItems}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? buttonDisabled : buttonBase}
          >
            <ChevronLeft size={16} />
          </button>
          <span
            style={{
              fontSize: 14,
              color: PreggaColors.neutral700,
              padding: "0 12px",
              fontWeight: 500,
            }}
          >
            {currentPage} / {totalPages || 1}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            style={currentPage === totalPages || totalPages === 0 ? buttonDisabled : buttonBase}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
          Showing <span style={{ fontWeight: 500, color: PreggaColors.neutral700 }}>{startItem}–{endItem}</span> of{" "}
          <span style={{ fontWeight: 500, color: PreggaColors.neutral700 }}>{totalItems}</span>
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${PreggaColors.neutral200}`,
              fontSize: 13,
              color: PreggaColors.neutral700,
              background: PreggaColors.white,
              cursor: "pointer",
              fontFamily: "'Inter', -apple-system, sans-serif",
              outline: "none",
            }}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? buttonDisabled : buttonBase}
            onMouseEnter={(e) => {
              if (currentPage !== 1) Object.assign(e.currentTarget.style, buttonHover);
            }}
            onMouseLeave={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.background = PreggaColors.white;
                e.currentTarget.style.borderColor = PreggaColors.neutral200;
              }
            }}
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? buttonDisabled : buttonBase}
          onMouseEnter={(e) => {
            if (currentPage !== 1) Object.assign(e.currentTarget.style, buttonHover);
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.background = PreggaColors.white;
              e.currentTarget.style.borderColor = PreggaColors.neutral200;
            }
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {totalPages > 0 &&
          Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                style={isActive ? buttonActive : { ...buttonBase, fontSize: 13 }}
                onMouseEnter={(e) => {
                  if (!isActive) Object.assign(e.currentTarget.style, buttonHover);
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = PreggaColors.white;
                    e.currentTarget.style.borderColor = PreggaColors.neutral200;
                  }
                }}
              >
                {pageNum}
              </button>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          style={currentPage === totalPages || totalPages === 0 ? buttonDisabled : buttonBase}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages && totalPages !== 0)
              Object.assign(e.currentTarget.style, buttonHover);
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages && totalPages !== 0) {
              e.currentTarget.style.background = PreggaColors.white;
              e.currentTarget.style.borderColor = PreggaColors.neutral200;
            }
          }}
        >
          <ChevronRight size={16} />
        </button>

        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            style={currentPage === totalPages || totalPages === 0 ? buttonDisabled : buttonBase}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages && totalPages !== 0)
                Object.assign(e.currentTarget.style, buttonHover);
            }}
            onMouseLeave={(e) => {
              if (currentPage !== totalPages && totalPages !== 0) {
                e.currentTarget.style.background = PreggaColors.white;
                e.currentTarget.style.borderColor = PreggaColors.neutral200;
              }
            }}
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
