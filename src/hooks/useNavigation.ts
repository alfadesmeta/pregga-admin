import { useState, useEffect, useCallback } from "react";

export type Section = 
  | "Dashboard" 
  | "Users" 
  | "Doulas" 
  | "Chat Monitoring";

export interface NavigationState {
  section: Section;
  subView?: string;
  tab?: string;
  modal?: string;
}

const sectionToHash: Record<Section, string> = {
  "Dashboard": "dashboard",
  "Users": "users",
  "Doulas": "doulas",
  "Chat Monitoring": "chat",
};

const hashToSection: Record<string, Section> = {
  "dashboard": "Dashboard",
  "users": "Users",
  "doulas": "Doulas",
  "chat": "Chat Monitoring",
};

function parseHash(): NavigationState {
  const hash = window.location.hash.slice(1);
  if (!hash) return { section: "Dashboard" };

  const parts = hash.split("/");
  const section = hashToSection[parts[0]] || "Dashboard";

  const state: NavigationState = { section };

  if (parts[1]) {
    if (parts[1] === "add" || parts[1] === "edit") {
      state.modal = parts[1];
    } else if (["active", "inactive", "pending", "archived"].includes(parts[1])) {
      state.tab = parts[1];
    } else {
      state.subView = parts[1];
      if (parts[2]) {
        state.tab = parts[2];
      }
    }
  }

  return state;
}

function buildHash(state: NavigationState): string {
  const sectionHash = sectionToHash[state.section];
  let hash = sectionHash;

  if (state.modal) {
    hash += `/${state.modal}`;
  } else if (state.subView) {
    hash += `/${state.subView}`;
    if (state.tab) {
      hash += `/${state.tab}`;
    }
  } else if (state.tab) {
    hash += `/${state.tab}`;
  }

  return hash;
}

export function useNavigation() {
  const [navState, setNavState] = useState<NavigationState>(parseHash);

  const navigate = useCallback((newState: Partial<NavigationState>, replace = false) => {
    const fullState: NavigationState = {
      section: newState.section ?? navState.section,
      subView: newState.subView,
      tab: newState.tab,
      modal: newState.modal,
    };

    const hash = buildHash(fullState);

    if (replace) {
      window.history.replaceState(fullState, "", `#${hash}`);
    } else {
      window.history.pushState(fullState, "", `#${hash}`);
    }

    setNavState(fullState);
  }, [navState.section]);

  const navigateToSection = useCallback((section: Section) => {
    navigate({ section, subView: undefined, tab: undefined, modal: undefined });
  }, [navigate]);

  const navigateToSubView = useCallback((subView: string, tab?: string) => {
    navigate({ subView, tab, modal: undefined });
  }, [navigate]);

  const navigateToTab = useCallback((tab: string) => {
    navigate({ ...navState, tab, modal: undefined });
  }, [navigate, navState]);

  const openModal = useCallback((modal: string) => {
    navigate({ ...navState, modal });
  }, [navigate, navState]);

  const closeModal = useCallback(() => {
    navigate({ ...navState, modal: undefined });
  }, [navigate, navState]);

  const goBack = useCallback(() => {
    if (navState.modal) {
      navigate({ ...navState, modal: undefined });
    } else if (navState.subView) {
      navigate({ section: navState.section, subView: undefined, tab: undefined, modal: undefined });
    } else {
      window.history.back();
    }
  }, [navigate, navState]);

  useEffect(() => {
    const handlePopState = () => {
      setNavState(parseHash());
    };

    window.addEventListener("popstate", handlePopState);

    if (!window.location.hash) {
      window.history.replaceState({ section: "Dashboard" }, "", "#dashboard");
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return {
    ...navState,
    navigate,
    navigateToSection,
    navigateToSubView,
    navigateToTab,
    openModal,
    closeModal,
    goBack,
  };
}
