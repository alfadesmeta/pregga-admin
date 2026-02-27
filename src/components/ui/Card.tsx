import React, { useState, useEffect } from "react";
import { PreggaColors, PreggaShadows } from "../../theme/colors";
import { AnimNum } from "./AnimNum";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: string | number;
  delay?: number;
}

export function Card({ children, title, subtitle, action, style, padding = "20px", delay = 0 }: CardProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 14,
        border: `1px solid ${PreggaColors.primary100}`,
        boxShadow: PreggaShadows.card,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s cubic-bezier(.16,1,.3,1)",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${PreggaColors.primary100}`,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: PreggaColors.neutral900,
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 13,
                  color: PreggaColors.neutral500,
                  margin: "4px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: title || action ? padding : padding }}>{children}</div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  subtitleIcon?: React.ReactNode;
  subtitleColor?: string;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
  trend?: "up" | "down";
  trendValue?: string;
}

export function KPICard({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
  subtitleIcon,
  subtitleColor,
  icon,
  iconColor,
  iconBg,
  delay = 0,
  trend,
  trendValue,
}: KPICardProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      style={{
        background: PreggaColors.white,
        borderRadius: 14,
        border: `1px solid ${PreggaColors.primary100}`,
        boxShadow: PreggaShadows.card,
        padding: "18px 20px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: PreggaColors.neutral500, fontFamily: "'Inter', sans-serif" }}>{title}</div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: iconBg || PreggaColors.primary50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor || PreggaColors.primary500,
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: PreggaColors.neutral900,
          lineHeight: 1,
          marginBottom: subtitle ? 10 : 0,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {prefix}
        {visible ? <AnimNum value={value} duration={1200} /> : 0}
        {suffix}
      </div>
      {(subtitle || trendValue) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {subtitle && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: subtitleColor || PreggaColors.neutral500,
              }}
            >
              {subtitleIcon}
              {subtitle}
            </div>
          )}
          {trendValue && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontSize: 12,
                fontWeight: 600,
                color: trend === "up" ? PreggaColors.success600 : PreggaColors.destructive500,
              }}
            >
              <span style={{ fontSize: 10 }}>{trend === "up" ? "▲" : "▼"}</span>
              {trendValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
