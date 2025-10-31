"use client";
import Image from "next/image";
import React, { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSidebar } from "../dashboard/(with-sidebar)/utils/sidebar-context";

function SideBarNavigation({
  image,
  label,
  icon,
}: {
  image?: string;
  label: string;
  icon?: ReactNode;
}) {
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  // Generate path from label: lowercase and remove spaces
  const getPath = (label: string) => {
    // Handle special case for "Help & Support"
    if (label === "Help & Support") return "/dashboard/support";

    if (label === "Dashboard") return "/dashboard";
    if (label === "AI Agent") return "/dashboard/aiagent/chat";

    // Handle special case for "Account Settings"
    if (label === "Account Settings") return "/dashboard/settings";

    if (label === "Chat Pay") return "/dashboard/chatPay";
    if (label === "Applications") return "/dashboard/applications";

    // For other labels, convert to lowercase and remove spaces
    return "/dashboard/" + label.toLowerCase().replace(/\s+/g, "");
  };

  // Check if current path matches this navigation item
  const pathname = usePathname();
  const isActive = pathname === getPath(label);

  const handleClick = () => {
    router.push(getPath(label));
  };

  return (
    <div
      className={`flex rounded-[10px] items-center gap-[16px] h-[50px] ${isCollapsed ? "w-[50px] py-[8px] px-[15px]" : "w-[220px] py-[16px] px-[24px]"} cursor-pointer transition-colors duration-200
        ${isActive || isHovered ? "bg-[#f0f0f0] text-black" : "text-[#4F4F4F]"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}>
      {icon ? (
        icon
      ) : (
        <Image
          src={image}
          alt={label.toLowerCase()}
          width={20}
          height={20}
          priority
          className='w-5 h-auto text-black'
        />
      )}

      {!isCollapsed && (
        <p className='font-[ClashGrotesk-Medium] font-[500] text-[16px] leading-[24px]'>
          {label}
        </p>
      )}
    </div>
  );
}

export default SideBarNavigation;
