"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSidebar } from "../dashboard/(with-sidebar)/utils/sidebar-context";
import { AlignLeft } from "lucide-react";
import WalletConnectButton from "../dashboard/(with-sidebar)/aiagent/component/ConnectButton";

function Header({ showHeaderLogo }) {
  const [isNotification, setIsNotification] = useState(true);

  const { toggleSidebar, isCollapsed } = useSidebar();

  return (
    <div className='flex w-full bg-[#FFFFFF] border gap-3 border-[#F2F2F2] items-center justify-between py-[10px] px-4'>
      <div className='md:hidden flex items-center gap-4'>
        <Button
          onClick={() => toggleSidebar()}
          className='md:hidden bg-white p-0 hover:bg-transparent  hover:text-black/70 shadow-none'
          aria-label='Open mobile menu'>
          <AlignLeft size={25} className='text-black/80 stroke-2' />
        </Button>

        {/* Astra logo */}
        <Link href='/dashboard' aria-label='Go to Astra homepage'>
          <Image
            src='/astraLogo.svg'
            alt='Astra brand logo'
            className='w-[120px] h-auto'
            width={200}
            height={40}
            priority
            sizes='(max-width: 768px) 100vw, 200px'
          />
        </Link>
      </div>

      {(isCollapsed || showHeaderLogo) && (
        <Link href='/dashboard' className='hidden md:flex'>
          <Image
            src='/logo.svg'
            alt='Astra logo'
            width={170}
            height={40}
            priority
            className='w-[170px] h-auto'
          />
        </Link>
      )}

      <div className='flex items-center md:gap-5 justify-end md:w-full px-0'>
        <Link href='/dashboard/aiagent/chat'>
          <Image
            src='/agent.svg'
            alt='create a new design'
            width={25.35}
            height={24}
            priority
            className='md:hidden w-auto h-auto hover:cursor-pointer'
          />
        </Link>

        <div className='hidden md:flex hover:cursor-pointer'>
          {isNotification ? (
            <Image
              src='/notification-on.svg'
              alt='notification'
              width={25.35}
              height={24}
              priority
            />
          ) : (
            <Image
              src='/notification.svg'
              alt='notification'
              width={16.86}
              height={21.5}
              priority
            />
          )}
        </div>
        <div className='lg:-mx-6'>
          <WalletConnectButton />
        </div>

        <div className='hidden md:flex items-center justify-center border border-primary gap-3 rounded-[50px] h-10 px-[16px]'>
          <Link
            href='/dashboard/aiagent/chat'
            className='font-[ClashGrotesk-Medium] font-[500]  text-sm hover:cursor-pointer hover:opacity-80'>
            Create New Design
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
