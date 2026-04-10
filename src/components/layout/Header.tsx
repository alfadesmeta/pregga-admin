import { useState } from "react";
import toast from "react-hot-toast";
import { PreggaColors } from "../../theme/colors";
import { Search, Menu, Calendar, RefreshCw } from "lucide-react";
import { invalidateCache } from "../../hooks";

interface HeaderProps {
  title: string;
  isMobile: boolean;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onRefresh?: () => void;
  onLogoClick?: () => void;
}

function formatDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: "short", 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  };
  return now.toLocaleDateString("en-US", options);
}

export function Header({
  title,
  isMobile,
  onMenuClick,
  onSearchClick,
  onRefresh,
  onLogoClick,
}: HeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    
    // Clear all cached data to force fresh fetch
    invalidateCache();
    
    // Trigger the refresh callback (changes refreshKey to remount views)
    onRefresh?.();
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Page refreshed");
    }, 800);
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        {isMobile && onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${PreggaColors.secondary300}`,
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
        {isMobile ? (
          <img
            src="/logo.png"
            alt="Pregga"
            style={{ height: 32, objectFit: "contain", cursor: onLogoClick ? "pointer" : "default" }}
            onClick={onLogoClick}
          />
        ) : (
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: PreggaColors.neutral900,
              letterSpacing: -0.5,
              margin: 0,
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
          >
            {title}
          </h1>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {onSearchClick && (
          <div
            onClick={onSearchClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${PreggaColors.secondary300}`,
              background: PreggaColors.white,
              color: PreggaColors.neutral500,
              cursor: "pointer",
              fontSize: 14,
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = PreggaColors.sage400;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = PreggaColors.secondary300;
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
                  background: PreggaColors.neutral100,
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

        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${PreggaColors.secondary300}`,
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

        {!isMobile && (
          <button
            onClick={handleRefresh}
            aria-label="Refresh data"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: `1px solid ${PreggaColors.secondary300}`,
              background: PreggaColors.white,
              cursor: isRefreshing ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: isRefreshing ? PreggaColors.sage600 : PreggaColors.neutral600,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.borderColor = PreggaColors.sage400;
                e.currentTarget.style.color = PreggaColors.sage600;
              }
            }}
            onMouseLeave={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.borderColor = PreggaColors.secondary300;
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
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
