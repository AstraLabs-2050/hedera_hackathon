"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo } from "react";
import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";
import { SidebarProvider } from "./utils/sidebar-context";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAichat = useMemo(
    () => pathname === "/dashboard/aichat/chat",
    [pathname]
  );

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const protectedRoutes = [
    "/dashboard",
    "/register/brand-profile",
    "/register/wallet",
  ];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated && isProtected) {
      router.replace("/login"); // Use replace to avoid adding to history
    }
  }, [isLoading, isAuthenticated, pathname, router, isProtected]);

  // Don't render content until auth check is complete
  if (isLoading && isProtected) {
    return null; // Or a loading spinner
  }

  // Render fallback if unauthenticated (prevents flashing content; useEffect will redirect)
  if (!isAuthenticated && isProtected) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className='flex w-full md:h-[100vh]'>
        <Sidebar />
        <div className='flex flex-1 w-full flex-col h-[100vh]'>
          <Header />
          <div
            className={`font-[ClashGrotesk-Medium] h-full ${
              isAichat ? "overflow-hidden" : "overflow-y-auto"
            }`}>
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
