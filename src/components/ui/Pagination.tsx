import React from "react";
import { PreggaColors } from "../../theme/colors";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isMobile?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isMobile = false,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const buttonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    border: `1px solid ${PreggaColors.primary200}`,
    background: PreggaColors.white,
    cursor: "pointer",
    color: PreggaColors.neutral600,
    transition: "all 0.15s",
  };

  const disabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  // Mobile simplified pagination
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
          {startItem}-{endItem} of {totalItems}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? disabledStyle : buttonStyle}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, color: PreggaColors.neutral700, padding: "0 8px" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? disabledStyle : buttonStyle}
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
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: PreggaColors.neutral500 }}>
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              border: `1px solid ${PreggaColors.primary200}`,
              fontSize: 13,
              color: PreggaColors.neutral700,
              background: PreggaColors.white,
              cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? disabledStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              e.currentTarget.style.background = PreggaColors.primary50;
              e.currentTarget.style.borderColor = PreggaColors.primary300;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PreggaColors.white;
            e.currentTarget.style.borderColor = PreggaColors.primary200;
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
              style={{
                ...buttonStyle,
                background: isActive ? PreggaColors.primary500 : PreggaColors.white,
                color: isActive ? PreggaColors.white : PreggaColors.neutral600,
                borderColor: isActive ? PreggaColors.primary500 : PreggaColors.primary200,
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = PreggaColors.primary50;
                  e.currentTarget.style.borderColor = PreggaColors.primary300;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = PreggaColors.white;
                  e.currentTarget.style.borderColor = PreggaColors.primary200;
                }
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? disabledStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              e.currentTarget.style.background = PreggaColors.primary50;
              e.currentTarget.style.borderColor = PreggaColors.primary300;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PreggaColors.white;
            e.currentTarget.style.borderColor = PreggaColors.primary200;
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
