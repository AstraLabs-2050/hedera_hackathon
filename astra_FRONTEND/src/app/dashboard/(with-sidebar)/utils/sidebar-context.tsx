"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextProps {
  isOpen: boolean;
  isCollapsed: boolean;
  showHeaderLogo: boolean;
  toggleSidebar: (open?: boolean) => void;
  toggleCollapse: () => void;
  setShowHeaderLogo: (show: boolean) => void; // ✅ expose control
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHeaderLogo, setShowHeaderLogo] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) setIsCollapsed(saved === "true");
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null; // or a skeleton, avoids flash
  }

  const toggleSidebar = (open?: boolean) => {
    setIsOpen(open !== undefined ? open : !isOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebar-collapsed", String(newState));
      return newState;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        showHeaderLogo,
        toggleSidebar,
        toggleCollapse,
        setShowHeaderLogo,
      }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
