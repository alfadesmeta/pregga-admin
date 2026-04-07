import { useState, useEffect } from "react";
import { PreggaColors } from "./theme/colors";
import { useWindowSize, useNavigation, Section, useRealtimeSync } from "./hooks";
import { Sidebar, Header, SearchModal } from "./components/layout";
import {
  DashboardView,
  UsersView,
  DoulasView,
  ChatView,
  BroadcastsView,
  WeeklyContentView,
  SubscriptionsView,
  SettingsView,
} from "./components/views";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "./types/database";

interface PreggaAdminDashboardProps {
  onSignOut: () => void;
  user: User;
  profile: Profile;
}

const sectionTitles: Record<Section, string> = {
  Dashboard: "Dashboard",
  Users: "Users",
  Doulas: "Doulas",
  Conversations: "Conversations",
  Broadcasts: "Broadcasts",
  "Weekly Content": "Weekly Content",
  Subscriptions: "Subscriptions",
  Settings: "Settings",
};

export function PreggaAdminDashboard({ onSignOut, user, profile }: PreggaAdminDashboardProps) {
  const { isMobile } = useWindowSize();
  const {
    section,
    subView,
    navigate,
    navigateToSection,
    navigateToSubView,
    goBack,
  } = useNavigation();

  useRealtimeSync();

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
        conversations: "Conversations",
        broadcasts: "Broadcasts",
        content: "Weekly Content",
        subscriptions: "Subscriptions",
        settings: "Settings",
      };
      const targetSection = sectionMap[result.id];
      if (targetSection) {
        navigateToSection(targetSection);
      }
    }
  };

  const handleNavigateToSectionWithSubView = (targetSection: string, subViewId: string) => {
    const sectionMap: Record<string, Section> = {
      "Users": "Users",
      "Doulas": "Doulas",
      "Conversations": "Conversations",
    };
    const mappedSection = sectionMap[targetSection] || (targetSection as Section);
    navigate({ section: mappedSection, subView: subViewId });
  };

  const handleNavigateToConversation = (conversationId: string) => {
    setReturnTo({ section, subView });
    navigate({ section: "Conversations", subView: conversationId });
  };

  const handleNavigateToDoula = (doulaId: string) => {
    setReturnTo({ section, subView });
    navigate({ section: "Doulas", subView: doulaId });
  };

  const renderView = () => {
    switch (section) {
      case "Dashboard":
        return (
          <DashboardView
            key={refreshKey}
            isMobile={isMobile}
            onNavigateToSubView={handleNavigateToSectionWithSubView}
            onNavigateToSection={(s) => navigateToSection(s as Section)}
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
            onNavigateToConversation={handleNavigateToConversation}
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
            onNavigateToConversation={handleNavigateToConversation}
          />
        );
      case "Conversations":
        return (
          <ChatView
            key={refreshKey}
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={goBack}
          />
        );
      case "Broadcasts":
        return (
          <BroadcastsView
            key={refreshKey}
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={handleGoBackWithReturn}
            onNavigateToUser={handleNavigateToUserWithReturn}
            onNavigateToDoula={handleNavigateToDoula}
          />
        );
      case "Weekly Content":
        return <WeeklyContentView key={refreshKey} isMobile={isMobile} />;
      case "Subscriptions":
        return (
          <SubscriptionsView
            key={refreshKey}
            isMobile={isMobile}
            subView={subView}
            onNavigateToSubView={navigateToSubView}
            onGoBack={goBack}
          />
        );
      case "Settings":
        return <SettingsView key={refreshKey} isMobile={isMobile} user={user} profile={profile} />;
      default:
        return <DashboardView key={refreshKey} isMobile={isMobile} />;
    }
  };

  return (
    <>
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
