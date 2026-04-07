import React from "react";
import { PreggaColors, PreggaShadows } from "../../theme/colors";
import { Card } from "./Card";
import { Button } from "./Button";
import { ArrowLeft } from "lucide-react";

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
  isMobile: boolean;
  center?: boolean;
  right?: boolean;
}

function StatItem({ label, value, highlight, isMobile, center, right }: StatItemProps) {
  return (
    <div
      style={{
        textAlign: isMobile ? "left" : center ? "center" : right ? "right" : "left",
        padding: isMobile ? "12px 16px" : "0",
        background: isMobile ? PreggaColors.neutral50 : "transparent",
        borderRadius: isMobile ? 10 : 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: PreggaColors.neutral400,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: highlight ? PreggaColors.sage600 : PreggaColors.neutral900,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export interface DetailHeaderStat {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  avatarFallback: string;
  avatarGradient?: [string, string];
  avatarIcon?: React.ReactNode;
  onGoBack: () => void;
  action?: React.ReactNode;
  stats?: DetailHeaderStat[];
  isMobile: boolean;
  accentColor?: string;
}

export function DetailHeader({
  title,
  subtitle,
  avatarUrl,
  avatarFallback,
  avatarGradient = [PreggaColors.sage400, PreggaColors.sage500],
  avatarIcon,
  onGoBack,
  action,
  stats = [],
  isMobile,
  accentColor,
}: DetailHeaderProps) {
  const initials = avatarFallback
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card padding="0" style={{ overflow: "hidden" }}>
      <div
        style={{
          height: 4,
          background: accentColor
            ? accentColor
            : `linear-gradient(90deg, ${avatarGradient[0]} 0%, ${avatarGradient[1]} 100%)`,
        }}
      />

      <div style={{ padding: isMobile ? "20px" : "24px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={onGoBack}
              style={{
                background: PreggaColors.neutral100,
                border: "none",
                cursor: "pointer",
                color: PreggaColors.neutral600,
                padding: 8,
                borderRadius: 8,
                display: "flex",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.neutral200)}
              onMouseLeave={(e) => (e.currentTarget.style.background = PreggaColors.neutral100)}
            >
              <ArrowLeft size={18} />
            </button>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${avatarGradient[0]} 0%, ${avatarGradient[1]} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: PreggaColors.white,
                fontSize: 18,
                fontWeight: 600,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : avatarIcon ? (
                avatarIcon
              ) : (
                initials
              )}
            </div>

            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: PreggaColors.neutral900,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  style={{
                    fontSize: 14,
                    color: PreggaColors.neutral500,
                    margin: "4px 0 0 0",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action}
        </div>

        {stats.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(stats.length, 4)}, 1fr)`,
              gap: isMobile ? 12 : 0,
              marginTop: 24,
              padding: isMobile ? 0 : "0 8px",
            }}
          >
            {stats.map((stat, index) => (
              <StatItem
                key={stat.label}
                label={stat.label}
                value={stat.value}
                highlight={stat.highlight}
                isMobile={isMobile}
                center={!isMobile && index > 0 && index < stats.length - 1}
                right={!isMobile && index === stats.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
