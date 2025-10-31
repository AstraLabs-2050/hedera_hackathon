"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import SideBarNavigation from "./sideBarNavigation";
import { useSidebar } from "../dashboard/(with-sidebar)/utils/sidebar-context";
import { FaTimes } from "react-icons/fa";
import clsx from "clsx";
import { PiShirtFolded } from "react-icons/pi";

function Sidebar() {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapse } = useSidebar();

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      toggleSidebar(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={sidebarRef}
      className={clsx(
        "fixed md:static top-0 left-0 h-screen z-50 transition-all bg-white duration-300 ease-in-out",
        isCollapsed ? "w-[90px]" : "w-[260px]",
        "border border-[#F2F2F2] flex flex-col p-[24px] gap-[24px]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}>
      <div className='flex items-center justify-between'>
        {!isCollapsed && (
          <Image
            src='/logo.svg'
            alt='logo'
            width={155.12}
            height={37}
            priority
            className='w-[120px] h-auto md:w-[155px] transition-opacity duration-300'
          />
        )}

        <button
          className='text-black/70 md:hidden'
          onClick={() => toggleSidebar(false)}>
          <FaTimes size={20} />
        </button>
      </div>

      <div className='flex flex-col gap-[24px]'>
        <button className='text-black/70' onClick={toggleCollapse}>
          <Image
            src='/minimize.svg'
            alt='minimize'
            width={17}
            height={14.14}
            priority
            className='w-[17px] h-auto'
          />
        </button>

        <div className='flex flex-col gap-[15px]'>
          <SideBarNavigation image='/dashboard.svg' label='Dashboard' />
          <SideBarNavigation image='/agent.svg' label='AI Agent' />
          <SideBarNavigation
            icon={<PiShirtFolded size={26} stroke='4' />}
            label='Design'
          />
          <SideBarNavigation
            image='/ongoing-jobs-icon.svg'
            label='Applications'
          />
          <SideBarNavigation image='/message.svg' label='Chat Pay' />
          <SideBarNavigation image='/settings.svg' label='Account Settings' />
          <SideBarNavigation image='/help.svg' label='Help & Support' />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
