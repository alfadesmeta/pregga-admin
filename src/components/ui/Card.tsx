import React, { useState, useEffect } from "react";
import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import { AnimNum } from "./AnimNum";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
  padding?: string | number;
  delay?: number;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  title,
  subtitle,
  action,
  style,
  padding = "20px",
  delay = 0,
  hoverable = false,
  onClick,
}: CardProps) {
  const [visible, setVisible] = useState(delay === 0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: PreggaColors.white,
        borderRadius: 12,
        border: `1px solid ${PreggaColors.neutral100}`,
        boxShadow: isHovered && hoverable ? PreggaShadows.md : PreggaShadows.sm,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible
          ? isHovered && hoverable
            ? "translateY(-2px)"
            : "translateY(0)"
          : "translateY(8px)",
        transition: PreggaTransitions.smooth,
        cursor: onClick || hoverable ? "pointer" : "default",
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
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
            background: PreggaColors.neutral50,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: PreggaColors.neutral900,
                  margin: 0,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  letterSpacing: "-0.01em",
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
                  margin: "2px 0 0",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
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
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function KPICard({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
  subtitleColor,
  icon,
  iconColor,
  iconBg,
  delay = 0,
  trend,
  trendValue,
}: KPICardProps) {
  const [visible, setVisible] = useState(delay === 0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const trendColor = trend === "up" ? PreggaColors.success600 : trend === "down" ? PreggaColors.error600 : PreggaColors.neutral500;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: PreggaColors.white,
        borderRadius: 12,
        border: `1px solid ${PreggaColors.neutral100}`,
        boxShadow: isHovered ? PreggaShadows.md : PreggaShadows.sm,
        padding: "20px",
        opacity: visible ? 1 : 0,
        transform: visible ? (isHovered ? "translateY(-2px)" : "translateY(0)") : "translateY(8px)",
        transition: PreggaTransitions.smooth,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: iconBg || PreggaColors.accent50,
          borderRadius: "0 0 0 100%",
          opacity: 0.5,
          transform: "translate(30%, -30%)",
        }}
      />
      
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: iconBg || PreggaColors.accent50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: iconColor || PreggaColors.accent600,
            }}
          >
            {icon}
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: PreggaColors.neutral500,
            fontFamily: "'Inter', -apple-system, sans-serif",
            marginBottom: 4,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: PreggaColors.neutral900,
            lineHeight: 1.1,
            fontFamily: "'Inter', -apple-system, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {prefix}
          {visible ? <AnimNum value={value} duration={1200} /> : 0}
          {suffix}
        </div>

        {(subtitle || trendValue) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 8,
              fontSize: 13,
              fontWeight: 500,
              color: subtitleColor || PreggaColors.neutral500,
            }}
          >
            {trendValue && (
              <span style={{ color: trendColor, display: "flex", alignItems: "center", gap: 2 }}>
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendValue}
              </span>
            )}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
