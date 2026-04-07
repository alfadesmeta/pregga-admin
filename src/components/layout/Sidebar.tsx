import { PreggaColors, PreggaShadows, PreggaTransitions } from "../../theme/colors";
import {
  X,
  LayoutDashboard,
  Users,
  Heart,
  MessageCircle,
  Radio,
  BookOpen,
  CreditCard,
  Cog,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import type { Section } from "../../hooks";
import logoImg from "../../assets/logo.png";

interface NavItem {
  name: Section;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Users & Doulas",
    items: [
      { name: "Users", label: "Users", icon: Users },
      { name: "Doulas", label: "Doulas", icon: Heart },
      { name: "Subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "Communication",
    items: [
      { name: "Conversations", label: "Conversations", icon: MessageCircle },
      { name: "Broadcasts", label: "Broadcasts", icon: Radio },
    ],
  },
  {
    title: "Content",
    items: [{ name: "Weekly Content", label: "Weekly Content", icon: BookOpen }],
  },
  {
    title: "System",
    items: [
      { name: "App Config", label: "App Config", icon: Cog },
      { name: "Settings", label: "Settings", icon: Settings },
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
        background: PreggaColors.white,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 13,
        borderRight: `1px solid ${PreggaColors.neutral100}`,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${PreggaColors.neutral100}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            transition: PreggaTransitions.fast,
          }}
          onClick={() => {
            onNavigate("Dashboard");
            if (isMobile) onClose();
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: PreggaShadows.sm,
            }}
          >
            <img
              src={logoImg}
              alt="Pregga"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: PreggaColors.neutral900,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Pregga
            </div>
            <div
              style={{
                fontSize: 11,
                color: PreggaColors.neutral400,
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              Admin Panel
            </div>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background: PreggaColors.neutral100,
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: PreggaColors.neutral500,
              display: "flex",
              borderRadius: 6,
              transition: PreggaTransitions.fast,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 16 }}>
            {sec.title && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: PreggaColors.neutral400,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "8px 12px 6px",
                }}
              >
                {sec.title}
              </div>
            )}
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
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: isActive ? PreggaColors.accent500 : "transparent",
                    color: isActive ? PreggaColors.white : PreggaColors.neutral600,
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: PreggaTransitions.fast,
                    marginBottom: 6,
                    boxShadow: isActive ? PreggaShadows.button : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = PreggaColors.neutral50;
                      e.currentTarget.style.color = PreggaColors.neutral900;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = PreggaColors.neutral600;
                    }
                  }}
                >
                  <IconComponent
                    size={18}
                    style={{
                      color: isActive ? PreggaColors.white : PreggaColors.neutral400,
                      transition: PreggaTransitions.fast,
                    }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        background: isActive ? "rgba(255,255,255,0.2)" : PreggaColors.error500,
                        color: PreggaColors.white,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 10,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight
                      size={14}
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Profile & Sign Out */}
      <div
        style={{
          padding: "12px",
          borderTop: `1px solid ${PreggaColors.neutral100}`,
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            background: PreggaColors.neutral50,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${PreggaColors.accent500} 0%, ${PreggaColors.accent600} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PreggaColors.white,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: PreggaShadows.button,
            }}
          >
            AD
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: PreggaColors.neutral900,
              }}
            >
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
            gap: 10,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: PreggaColors.neutral500,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            transition: PreggaTransitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PreggaColors.error50;
            e.currentTarget.style.color = PreggaColors.error600;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = PreggaColors.neutral500;
          }}
        >
          <LogOut size={18} />
          <span>Sign out</span>
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
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 998,
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: "opacity 0.2s ease",
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
            transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: open ? PreggaShadows.xl : "none",
          }}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
}
