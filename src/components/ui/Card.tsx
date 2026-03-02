import React, { useState, useEffect } from "react";
import { PreggaColors } from "../../theme/colors";
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
        borderRadius: 16,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.1)",
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
            borderBottom: `1px solid ${PreggaColors.neutral100}`,
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
  subtitleColor,
  icon,
  iconColor,
  iconBg,
  delay = 0,
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
        borderRadius: 16,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.1)",
        padding: "24px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.5s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {/* Icon in top right */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: iconBg || PreggaColors.primary50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: iconColor || PreggaColors.primary500,
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      
      {/* Title */}
      <div 
        style={{ 
          fontSize: 14, 
          fontWeight: 500,
          color: PreggaColors.neutral700, 
          fontFamily: "'Inter', sans-serif",
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      
      {/* Value */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 500,
          color: PreggaColors.neutral900,
          lineHeight: 1.2,
          marginBottom: 4,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {prefix}
        {visible ? <AnimNum value={value} duration={1200} /> : 0}
        {suffix}
      </div>
      
      {/* Subtitle */}
      {(subtitle || trendValue) && (
        <div 
          style={{ 
            fontSize: 14, 
            fontWeight: 500,
            color: subtitleColor || PreggaColors.neutral600,
          }}
        >
          {trendValue && (
            <span style={{ marginRight: 4 }}>
              {trendValue}
            </span>
          )}
          {subtitle}
        </div>
      )}
    </div>
  );
}
