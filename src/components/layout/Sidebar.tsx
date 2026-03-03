import { PreggaColors } from "../../theme/colors";
import {
  X,
  LayoutDashboard,
  Users,
  Heart,
  MessageCircle,
  LogOut,
} from "lucide-react";
import type { Section } from "../../hooks";

interface NavItem {
  name: Section;
  label: string;
  icon: React.ElementType;
}

interface NavSection {
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [
      { name: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
      { name: "Users", label: "User Management", icon: Users },
      { name: "Doulas", label: "Doula Management", icon: Heart },
      { name: "Chat Monitoring", label: "Chat Monitoring", icon: MessageCircle },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  activeSection: Section;
  onNavigate: (section: Section) => void;
  onSignOut?: () => void;
}

export function Sidebar({
  open,
  onClose,
  isMobile,
  activeSection,
  onNavigate,
  onSignOut,
}: SidebarProps) {
  const sidebarContent = (
    <aside
      style={{
        width: "100%",
        height: "100%",
        background: PreggaColors.sidebarBg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        fontSize: 13,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
          onClick={() => {
            onNavigate("Dashboard");
            if (isMobile) onClose();
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: PreggaColors.terracotta500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.white,
              fontWeight: 700,
              fontSize: 18,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            <Heart size={20} fill={PreggaColors.white} />
          </div>
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: PreggaColors.neutral900,
                fontFamily: "'Playfair Display', serif",
                letterSpacing: 0.5,
              }}
            >
              Pregga
            </div>
            <div style={{ fontSize: 11, color: PreggaColors.neutral500, marginTop: -2 }}>
              Admin Panel
            </div>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: PreggaColors.neutral600,
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {sections.map((sec, si) => (
          <div key={si}>
            {sec.items.map((item) => {
              const isActive = activeSection === item.name;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    onNavigate(item.name);
                    if (isMobile) onClose();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: isActive ? PreggaColors.sidebarActive : "transparent",
                    color: isActive ? PreggaColors.sidebarTextActive : PreggaColors.neutral700,
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "all 0.15s",
                    marginBottom: 4,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = PreggaColors.sidebarHover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <IconComponent
                    size={20}
                    style={{
                      color: isActive ? PreggaColors.white : PreggaColors.neutral600,
                    }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Profile & Sign Out */}
      <div
        style={{
          padding: "16px",
          borderTop: `1px solid rgba(0, 0, 0, 0.08)`,
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: PreggaColors.accent500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.white,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            AD
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: PreggaColors.neutral900 }}>
              Admin User
            </div>
            <div
              style={{
                fontSize: 12,
                color: PreggaColors.neutral500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              admin@pregga.com
            </div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: PreggaColors.neutral600,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = PreggaColors.sidebarHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );

  if (isMobile) {
    return (
      <>
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 998,
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 280,
            zIndex: 999,
            transform: open ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s cubic-bezier(.16,1,.3,1)",
          }}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
}
