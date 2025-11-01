"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { base, baseSepolia } from "thirdweb/chains";
import { client } from "@/client";
import { getContract, readContract } from "thirdweb";
import { USDC_ADDRESS } from "@/utils/constant";
import { inAppWallet } from "thirdweb/wallets";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSidebar } from "../dashboard/(with-sidebar)/utils/sidebar-context";
import { AlignLeft } from "lucide-react";
import api from "@/utils/api.class";
import MintButton from "../dashboard/(with-sidebar)/aiagent/component/MintButton";

// Define the ABI item for the balanceOf function for type safety
const BALANCE_OF_ABI_ITEM = {
  type: "function",
  name: "balanceOf",
  stateMutability: "view",
  inputs: [{ type: "address", name: "account" }],
  outputs: [{ type: "uint256", name: "" }],
} as const;

// Get the USDC contract outside of components to avoid re-initialization
const getUSDCContract = () => {
  if (
    !USDC_ADDRESS ||
    typeof USDC_ADDRESS !== "string" ||
    !USDC_ADDRESS.startsWith("0x")
  ) {
    console.error(
      "Invalid or missing USDC_ADDRESS in constants.",
      USDC_ADDRESS
    );
    return undefined;
  }

  try {
    return getContract({
      client,
      address: USDC_ADDRESS,
      chain: baseSepolia,
    });
  } catch (e) {
    console.error("Failed to initialize USDC contract:", e);
    return undefined;
  }
};

// Initialize contract once
const usdcContract = getUSDCContract();

function Header({ showHeaderLogo }) {
  const [isNotification, setIsNotification] = useState(true);
  // const account = useActiveAccount();
  const [balance, setBalance] = useState<string>("0.00");
  const [starting, setStarting] = useState(false);

  // Use a separate effect to fetch balance when account changes
  // useEffect(() => {
  //   let isMounted = true;

  //   const fetchBalance = async () => {
  //     if (!account?.address || !usdcContract) {
  //       if (isMounted) setBalance("0.00");
  //       return;
  //     }

  //     try {
  //       // Use the readContract function from thirdweb with proper error handling
  //       const result = await readContract({
  //         contract: usdcContract,
  //         method: BALANCE_OF_ABI_ITEM,
  //         params: [account.address],
  //       }).catch((error) => {
  //         return BigInt(0);
  //       });

  //       if (isMounted) {
  //         // Handle both BigInt and string responses
  //         const balanceValue =
  //           typeof result === "string" ? result : result.toString();
  //         setBalance((Number(balanceValue) / 1e6).toFixed(2)); // Convert to USDC with 6 decimals
  //       }
  //     } catch (error) {
  //       console.error("Error fetching USDC balance:", error);
  //       if (isMounted) {
  //         setBalance("0.00");
  //       }
  //     }
  //   };

  //   // Set up polling for balance updates
  //   fetchBalance();
  //   const intervalId = setInterval(fetchBalance, 10000); // Poll every 10 seconds

  //   return () => {
  //     isMounted = false;
  //     clearInterval(intervalId);
  //   };
  // }, [account?.address]);

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

      <div className='flex items-center md:gap-2 justify-end md:w-full px-0'>
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
        <div>
          <MintButton />
        </div>

        <div className='hidden md:flex items-center justify-center border border-primary gap-3 rounded-[50px] h-10 px-[16px]'>
          <Link
            href='/dashboard/aiagent/chat'
            className='font-[ClashGrotesk-Medium] font-[500]  text-sm hover:cursor-pointer hover:opacity-80'>
            {starting ? "Creating..." : "Create New Design"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
