import React from "react";
import { PreggaColors } from "../../theme/colors";
import { Pagination } from "./Pagination";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  isMobile?: boolean;
  mobileCardRender?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  emptyMessage = "No data found",
  loading = false,
  renderExpandedRow,
  isMobile = false,
  mobileCardRender,
}: DataTableProps<T>) {
  const headerStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
    color: PreggaColors.neutral500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: `1px solid ${PreggaColors.neutral100}`,
    background: PreggaColors.white,
    fontFamily: "'Inter', sans-serif",
  };

  const cellStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: 14,
    color: PreggaColors.neutral800,
    borderBottom: `1px solid ${PreggaColors.neutral100}`,
    fontFamily: "'Inter', sans-serif",
  };

  if (loading) {
    return (
      <div
        style={{
          background: PreggaColors.white,
          borderRadius: 16,
          boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 60, textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${PreggaColors.neutral200}`,
              borderTopColor: PreggaColors.accent500,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div style={{ color: PreggaColors.neutral500, fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Mobile card view
  if (isMobile && mobileCardRender) {
    return (
      <div>
        {data.length === 0 ? (
          <div
            style={{
              background: PreggaColors.white,
              borderRadius: 16,
              padding: 60,
              textAlign: "center",
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ color: PreggaColors.neutral400, fontSize: 14 }}>{emptyMessage}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.map((row) => (
              <div
                key={row.id}
                onClick={() => onRowClick?.(row)}
                style={{
                  background: PreggaColors.white,
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                  cursor: onRowClick ? "pointer" : "default",
                }}
              >
                {mobileCardRender(row)}
              </div>
            ))}
          </div>
        )}

        {totalPages > 0 && (
          <div
            style={{
              marginTop: 16,
              background: PreggaColors.white,
              borderRadius: 12,
              padding: "12px 16px",
              boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              isMobile={true}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 16,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} style={{ ...headerStyle, width: col.width }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ ...cellStyle, textAlign: "center", padding: 60 }}>
                  <div style={{ color: PreggaColors.neutral400, fontSize: 14 }}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => onRowClick?.(row)}
                    style={{
                      cursor: onRowClick ? "pointer" : "default",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick) e.currentTarget.style.background = PreggaColors.neutral50;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {columns.map((col) => {
                      const value = (row as Record<string, unknown>)[col.key as string];
                      return (
                        <td
                          key={String(col.key)}
                          style={{
                            ...cellStyle,
                            borderBottom:
                              rowIndex === data.length - 1 && !renderExpandedRow
                                ? "none"
                                : `1px solid ${PreggaColors.neutral100}`,
                          }}
                        >
                          {col.render ? col.render(value, row) : String(value ?? "")}
                        </td>
                      );
                    })}
                  </tr>
                  {renderExpandedRow?.(row)}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${PreggaColors.neutral100}`,
            background: PreggaColors.white,
          }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
