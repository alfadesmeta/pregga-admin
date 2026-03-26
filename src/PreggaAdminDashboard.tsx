import { useState, useEffect } from "react";
import { PreggaColors } from "./theme/colors";
import { useWindowSize, useNavigation, Section } from "./hooks";
import { Sidebar, Header, SearchModal } from "./components/layout";
import {
  DashboardView,
  UsersView,
  DoulasView,
  ChatView,
} from "./components/views";

interface PreggaAdminDashboardProps {
  onSignOut: () => void;
}

const sectionTitles: Record<Section, string> = {
  Dashboard: "Dashboard",
  Users: "User Management",
  Doulas: "Doula Management",
  "Chat Monitoring": "Chat Monitoring",
};

export function PreggaAdminDashboard({ onSignOut }: PreggaAdminDashboardProps) {
  const { isMobile } = useWindowSize();
  const {
    section,
    subView,
    navigate,
    navigateToSection,
    navigateToSubView,
    goBack,
  } = useNavigation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [returnTo, setReturnTo] = useState<{ section: Section; subView?: string } | null>(null);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleNavigateToUserWithReturn = (userId: string) => {
    setReturnTo({ section, subView });
    navigate({ section: "Users", subView: userId });
  };

  const handleGoBackWithReturn = () => {
    if (returnTo) {
      navigate({ section: returnTo.section, subView: returnTo.subView });
      setReturnTo(null);
    } else {
      goBack();
    }
  };

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
      };
      const targetSection = sectionMap[result.id];
      if (targetSection) {
        navigateToSection(targetSection);
      }
    }
  };

  const handleNavigateToSectionWithSubView = (targetSection: string, subViewId: string) => {
    const sectionMap: Record<string, Section> = {
      "User Management": "Users",
      "Doula Management": "Doulas",
    };
    const mappedSection = sectionMap[targetSection] || (targetSection as Section);
    // Use navigate to set both section and subView at once
    navigate({ section: mappedSection, subView: subViewId });
  };

  const renderView = () => {
    switch (section) {
      case "Dashboard":
        return (
          <DashboardView
            key={refreshKey}
            isMobile={isMobile}
            onNavigateToSubView={handleNavigateToSectionWithSubView}
          />
        );
      case "Users":
        return (
          <UsersView
            key={refreshKey}
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={handleGoBackWithReturn}
          />
        );
      case "Doulas":
        return (
          <DoulasView
            key={refreshKey}
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={goBack}
            onNavigateToUserWithReturn={handleNavigateToUserWithReturn}
          />
        );
      case "Chat Monitoring":
        return <ChatView key={refreshKey} isMobile={isMobile} />;
      default:
        return <DashboardView key={refreshKey} isMobile={isMobile} />;
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
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition {
          animation: pageIn 0.3s ease-out forwards;
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
            overflowY: "auto",
            overflowX: "hidden",
            background: PreggaColors.bgSecondary,
          }}
        >
          {/* Content wrapper with padding */}
          <div
            style={{
              padding: isMobile ? "20px 16px" : "24px 32px",
              minHeight: "100%",
            }}
          >
            {/* Header scrolls with content */}
            <Header
              title={sectionTitles[section]}
              isMobile={isMobile}
              onMenuClick={() => setSidebarOpen(true)}
              onSearchClick={() => setSearchOpen(true)}
              onRefresh={handleRefresh}
            />

            {/* Page Content with transition */}
            <div
              key={section + (subView || "")}
              className="page-transition"
            >
              {renderView()}
            </div>
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
