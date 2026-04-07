import React, { useState, useEffect } from "react";
import { PreggaColors } from "../../theme/colors";

export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

interface ShimmerProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export function Shimmer({
  width = "100%",
  height = 16,
  borderRadius = 6,
  style,
}: ShimmerProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

interface ShimmerKPICardProps {
  delay?: number;
}

export function ShimmerKPICard({ delay = 0 }: ShimmerKPICardProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const shimGrad = `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`;

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 14,
        border: `1px solid ${PreggaColors.secondary300}`,
        padding: "18px 20px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.4s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div
          style={{
            width: 80,
            height: 12,
            borderRadius: 4,
            background: shimGrad,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: PreggaColors.neutral100,
          }}
        />
      </div>
      <div
        style={{
          width: 60,
          height: 28,
          borderRadius: 6,
          background: shimGrad,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
          marginBottom: 8,
        }}
      />
      <div
        style={{
          width: 100,
          height: 10,
          borderRadius: 4,
          background: PreggaColors.neutral100,
        }}
      />
    </div>
  );
}

interface ShimmerTableRowsProps {
  rows?: number;
  columns?: number;
  isMobile?: boolean;
  delay?: number;
}

export function ShimmerTableRows({ rows = 5, columns = 4, isMobile = false, delay = 0 }: ShimmerTableRowsProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const shimGrad = `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`;

  if (isMobile) {
    return (
      <>
        {Array.from({ length: rows }).map((_, i) => (
          <tr
            key={i}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
              transition: `all 0.3s ease-out ${i * 50}ms`,
            }}
          >
            <td colSpan={columns} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: shimGrad,
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s ease-in-out infinite",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "70%",
                        height: 14,
                        borderRadius: 4,
                        background: shimGrad,
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s ease-in-out infinite",
                        marginBottom: 6,
                      }}
                    />
                    <div
                      style={{
                        width: "50%",
                        height: 10,
                        borderRadius: 4,
                        background: PreggaColors.neutral100,
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: 80,
                      height: 10,
                      borderRadius: 4,
                      background: PreggaColors.neutral100,
                    }}
                  />
                  <div
                    style={{
                      width: 60,
                      height: 20,
                      borderRadius: 10,
                      background: shimGrad,
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr
          key={i}
          style={{
            borderBottom: i < rows - 1 ? `1px solid ${PreggaColors.neutral100}` : "none",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
            transition: `all 0.3s ease-out ${i * 50}ms`,
          }}
        >
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} style={{ padding: "16px 18px" }}>
              <div
                style={{
                  width: j === 0 ? "60%" : j === columns - 1 ? 60 : "80%",
                  height: j === columns - 1 ? 22 : 14,
                  borderRadius: j === columns - 1 ? 11 : 4,
                  background: shimGrad,
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

interface ShimmerListItemProps {
  delay?: number;
}

export function ShimmerListItem({ delay = 0 }: ShimmerListItemProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const shimGrad = `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 20px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.3s ease-out",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: shimGrad,
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: "70%",
            height: 14,
            borderRadius: 4,
            background: shimGrad,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
            marginBottom: 6,
          }}
        />
        <div
          style={{
            width: "50%",
            height: 10,
            borderRadius: 4,
            background: PreggaColors.neutral100,
          }}
        />
      </div>
      <div
        style={{
          width: 70,
          height: 32,
          borderRadius: 8,
          background: PreggaColors.neutral100,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

interface ShimmerCardProps {
  delay?: number;
  height?: number;
}

export function ShimmerCard({ delay = 0, height = 200 }: ShimmerCardProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const shimGrad = `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`;

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 14,
        border: `1px solid ${PreggaColors.secondary300}`,
        height,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "all 0.4s ease-out",
      }}
    >
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${PreggaColors.neutral100}` }}>
        <div
          style={{
            width: 120,
            height: 14,
            borderRadius: 4,
            background: shimGrad,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>
      <div style={{ padding: 20 }}>
        <div
          style={{
            width: "100%",
            height: height - 80,
            borderRadius: 8,
            background: shimGrad,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
}
