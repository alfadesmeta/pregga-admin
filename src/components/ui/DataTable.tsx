import React from "react";
import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import { Pagination } from "./Pagination";
import { Inbox } from "lucide-react";

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
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
  emptyIcon?: React.ReactNode;
  loading?: boolean;
  isLoading?: boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  isMobile?: boolean;
  mobileCardRender?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
}

function ShimmerRow({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td
          key={i}
          style={{
            padding: "16px",
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
          }}
        >
          <div
            style={{
              height: 16,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
              width: i === 0 ? "60%" : i === columns - 1 ? "40%" : "80%",
            }}
          />
        </td>
      ))}
    </tr>
  );
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
  emptyIcon,
  loading = false,
  isLoading = false,
  renderExpandedRow,
  isMobile = false,
  mobileCardRender,
  stickyHeader = false,
}: DataTableProps<T>) {
  const isLoadingState = loading || isLoading;

  const headerStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 600,
    color: PreggaColors.neutral500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: `1px solid ${PreggaColors.neutral200}`,
    background: PreggaColors.neutral50,
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: stickyHeader ? "sticky" : "static",
    top: 0,
    zIndex: 1,
  };

  const cellStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: 14,
    color: PreggaColors.neutral700,
    borderBottom: `1px solid ${PreggaColors.neutral100}`,
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  if (isLoadingState) {
    return (
      <>
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <div
          style={{
            background: PreggaColors.white,
            borderRadius: 12,
            border: `1px solid ${PreggaColors.neutral100}`,
            boxShadow: PreggaShadows.sm,
            overflow: "hidden",
          }}
        >
          {isMobile ? (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: `1px solid ${PreggaColors.neutral100}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          height: 14,
                          width: "60%",
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                          marginBottom: 6,
                        }}
                      />
                      <div
                        style={{
                          height: 12,
                          width: "40%",
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <ShimmerRow key={i} columns={columns.length} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  if (isMobile && mobileCardRender) {
    return (
      <div>
        {data.length === 0 ? (
          <div
            style={{
              background: PreggaColors.white,
              borderRadius: 12,
              border: `1px solid ${PreggaColors.neutral100}`,
              padding: "48px 24px",
              textAlign: "center",
              boxShadow: PreggaShadows.sm,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: PreggaColors.neutral100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: PreggaColors.neutral400,
              }}
            >
              {emptyIcon || <Inbox size={24} />}
            </div>
            <div style={{ color: PreggaColors.neutral500, fontSize: 14 }}>{emptyMessage}</div>
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
                  border: `1px solid ${PreggaColors.neutral100}`,
                  padding: 16,
                  boxShadow: PreggaShadows.sm,
                  cursor: onRowClick ? "pointer" : "default",
                  transition: PreggaTransitions.fast,
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
              border: `1px solid ${PreggaColors.neutral100}`,
              padding: "12px 16px",
              boxShadow: PreggaShadows.sm,
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
        borderRadius: 12,
        border: `1px solid ${PreggaColors.neutral100}`,
        boxShadow: PreggaShadows.sm,
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    ...headerStyle,
                    width: col.width,
                    textAlign: col.align || "left",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ ...cellStyle, textAlign: "center", padding: "48px 24px" }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: PreggaColors.neutral100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      color: PreggaColors.neutral400,
                    }}
                  >
                    {emptyIcon || <Inbox size={24} />}
                  </div>
                  <div style={{ color: PreggaColors.neutral500, fontSize: 14 }}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => onRowClick?.(row)}
                    style={{
                      cursor: onRowClick ? "pointer" : "default",
                      transition: PreggaTransitions.fast,
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
                            textAlign: col.align || "left",
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

      {totalPages > 0 && data.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: `1px solid ${PreggaColors.neutral100}`,
            background: PreggaColors.neutral50,
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
