import { useState, useEffect } from "react";
import { PreggaColors } from "./theme/colors";
import { useWindowSize, useNavigation, Section } from "./hooks";
import { Sidebar, Header, SearchModal } from "./components/layout";
import {
  DashboardView,
  UsersView,
  DoulasView,
  ChatView,
  SettingsView,
} from "./components/views";

interface PreggaAdminDashboardProps {
  onSignOut: () => void;
}

const sectionTitles: Record<Section, string> = {
  Dashboard: "Dashboard",
  Users: "Users",
  Doulas: "Doulas",
  "Chat Monitoring": "Chat Monitoring",
  Settings: "Settings",
};

export function PreggaAdminDashboard({ onSignOut }: PreggaAdminDashboardProps) {
  const { isMobile } = useWindowSize();
  const {
    section,
    subView,
    navigateToSection,
    navigateToSubView,
    goBack,
  } = useNavigation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSelect = (result: { id: string; type: string }) => {
    if (result.type === "page") {
      const sectionMap: Record<string, Section> = {
        dashboard: "Dashboard",
        users: "Users",
        doulas: "Doulas",
        chat: "Chat Monitoring",
        settings: "Settings",
      };
      const targetSection = sectionMap[result.id];
      if (targetSection) {
        navigateToSection(targetSection);
      }
    }
  };

  const renderView = () => {
    switch (section) {
      case "Dashboard":
        return (
          <DashboardView
            isMobile={isMobile}
            onNavigate={(s) => navigateToSection(s as Section)}
          />
        );
      case "Users":
        return (
          <UsersView
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={goBack}
          />
        );
      case "Doulas":
        return (
          <DoulasView
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={goBack}
          />
        );
      case "Chat Monitoring":
        return <ChatView isMobile={isMobile} />;
      case "Settings":
        return <SettingsView isMobile={isMobile} />;
      default:
        return <DashboardView isMobile={isMobile} />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body, #root {
          height: 100%;
          width: 100%;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: ${PreggaColors.bgSecondary};
          color: ${PreggaColors.neutral900};
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${PreggaColors.neutral200};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${PreggaColors.neutral300};
        }
      `}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        {isMobile ? (
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isMobile={true}
            activeSection={section}
            onNavigate={navigateToSection}
            onSignOut={onSignOut}
          />
        ) : (
          <div
            style={{
              width: 260,
              minWidth: 260,
              height: "100%",
              flexShrink: 0,
            }}
          >
            <Sidebar
              open={true}
              onClose={() => {}}
              isMobile={false}
              activeSection={section}
              onNavigate={navigateToSection}
              onSignOut={onSignOut}
            />
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: PreggaColors.bgSecondary,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: isMobile ? "16px 16px 0" : "20px 24px 0",
              flexShrink: 0,
            }}
          >
            <Header
              title={sectionTitles[section]}
              isMobile={isMobile}
              onMenuClick={() => setSidebarOpen(true)}
              onSearchClick={() => setSearchOpen(true)}
            />
          </div>

          {/* Scrollable Content */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              padding: isMobile ? "16px" : "20px 24px 24px",
            }}
          >
            {renderView()}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
    </>
  );
}
