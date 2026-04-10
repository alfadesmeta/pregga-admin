import React, { useState, useEffect } from "react";
import { PreggaColors, PreggaTransitions } from "../../theme/colors";
import { AnimNum } from "./AnimNum";

interface KPIStatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  subtitleIcon?: React.ReactNode;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
  onClick?: () => void;
  isLoading?: boolean;
}

export function KPIStatCard({
  title,
  value,
  subtitle,
  subtitleIcon,
  subtitleColor,
  icon,
  iconColor = PreggaColors.sage600,
  iconBg = PreggaColors.sage100,
  delay = 0,
  onClick,
  isLoading = false,
}: KPIStatCardProps) {
  const [visible, setVisible] = useState(delay === 0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const shimGrad = `linear-gradient(90deg, ${PreggaColors.neutral100} 25%, ${PreggaColors.neutral50} 50%, ${PreggaColors.neutral100} 75%)`;

  if (isLoading) {
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

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: PreggaColors.white,
        borderRadius: 14,
        border: `1px solid ${hovered && onClick ? PreggaColors.sage400 : PreggaColors.secondary300}`,
        padding: "18px 20px",
        cursor: onClick ? "pointer" : "default",
        transition: PreggaTransitions.normal,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        boxShadow: hovered && onClick ? "0 4px 12px rgba(107, 127, 95, 0.12)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: PreggaColors.neutral500,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: PreggaColors.neutral900,
          fontFamily: "'Inter', -apple-system, sans-serif",
          letterSpacing: "-0.5px",
          marginBottom: 4,
        }}
      >
        <AnimNum value={value} />
      </div>

      {subtitle && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: subtitleColor || PreggaColors.neutral500,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
          {subtitleIcon}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}
