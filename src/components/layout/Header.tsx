import { useState } from "react";
import { PreggaColors } from "../../theme/colors";
import { Search, Menu, Calendar, RefreshCw } from "lucide-react";

interface HeaderProps {
  title: string;
  isMobile: boolean;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onRefresh?: () => void;
}

function formatDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return now.toLocaleDateString("en-US", options).replace(",", "");
}

export function Header({
  title,
  isMobile,
  onMenuClick,
  onSearchClick,
  onRefresh,
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              border: `1px solid ${PreggaColors.neutral200}`,
              background: PreggaColors.white,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: PreggaColors.neutral600,
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <h1
          style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 600,
            color: PreggaColors.neutral900,
            letterSpacing: -0.5,
            margin: 0,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Search */}
        {onSearchClick && (
          <div
            onClick={onSearchClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${PreggaColors.neutral200}`,
              background: PreggaColors.white,
              color: PreggaColors.neutral400,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            <Search size={16} />
            {!isMobile && <span>Search...</span>}
            {!isMobile && (
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: PreggaColors.neutral100,
                  color: PreggaColors.neutral500,
                  marginLeft: 8,
                  fontWeight: 500,
                }}
              >
                ⌘K
              </span>
            )}
          </div>
        )}

        {/* Date Display */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${PreggaColors.neutral200}`,
              background: PreggaColors.white,
              color: PreggaColors.neutral700,
              fontSize: 14,
            }}
          >
            <Calendar size={16} style={{ color: PreggaColors.neutral500 }} />
            <span>{formatDate()}</span>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: `1px solid ${PreggaColors.neutral200}`,
            background: PreggaColors.white,
            cursor: isRefreshing ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: isRefreshing ? PreggaColors.accent500 : PreggaColors.neutral500,
          }}
        >
          <RefreshCw
            size={16}
            style={{
              animation: isRefreshing ? "spin 1s linear infinite" : "none",
            }}
          />
        </button>
      </div>
    </div>
  );
}
