import { useState } from "react";
import { PreggaColors } from "../../theme/colors";
import { Search, Menu, Calendar, RefreshCw, Bell } from "lucide-react";

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
  return now.toLocaleDateString("en-US", options);
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
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${PreggaColors.primary200}`,
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
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onSearchClick && (
          <div
            onClick={onSearchClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${PreggaColors.primary200}`,
              background: PreggaColors.white,
              color: PreggaColors.neutral500,
              cursor: "pointer",
              fontSize: 14,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = PreggaColors.primary300;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = PreggaColors.primary200;
            }}
          >
            <Search size={16} />
            {!isMobile && <span>Search...</span>}
            {!isMobile && (
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 5,
                  background: PreggaColors.primary100,
                  color: PreggaColors.neutral500,
                  marginLeft: 12,
                  fontWeight: 500,
                }}
              >
                ⌘K
              </span>
            )}
          </div>
        )}

        {/* Notifications */}
        <button
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${PreggaColors.primary200}`,
            background: PreggaColors.white,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: PreggaColors.neutral600,
            position: "relative",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = PreggaColors.primary300;
            e.currentTarget.style.color = PreggaColors.primary600;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = PreggaColors.primary200;
            e.currentTarget.style.color = PreggaColors.neutral600;
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: PreggaColors.rose500,
              border: `2px solid ${PreggaColors.white}`,
            }}
          />
        </button>

        {/* Date Display */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${PreggaColors.primary200}`,
              background: PreggaColors.white,
              color: PreggaColors.neutral700,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Calendar size={16} />
            <span>{formatDate()}</span>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: `1px solid ${PreggaColors.primary200}`,
            background: PreggaColors.white,
            cursor: isRefreshing ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: isRefreshing ? PreggaColors.primary500 : PreggaColors.neutral600,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.borderColor = PreggaColors.primary300;
              e.currentTarget.style.color = PreggaColors.primary600;
            }
          }}
          onMouseLeave={(e) => {
            if (!isRefreshing) {
              e.currentTarget.style.borderColor = PreggaColors.primary200;
              e.currentTarget.style.color = PreggaColors.neutral600;
            }
          }}
        >
          <RefreshCw
            size={18}
            style={{
              animation: isRefreshing ? "spin 1s linear infinite" : "none",
            }}
          />
        </button>
      </div>
    </div>
  );
}
