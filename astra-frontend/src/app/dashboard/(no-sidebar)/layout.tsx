"use client";

export const dynamic = "force-dynamic";

import Header from "@/app/components/header";
import { SidebarProvider } from "@/app/dashboard/(with-sidebar)/utils/sidebar-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className='min-h-screen bg-[#F9F9F9]'>
        {/* Fixed Header */}
        <div className='fixed top-0 left-0 right-0 z-50 bg-white shadow-sm'>
          <Header showHeaderLogo={true} />
        </div>

        {/* Main Content with Top Padding */}
        <div className='pt-[80px] px-4 md:px-[60px] py-6 font-[ClashGrotesk-regular]'>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
