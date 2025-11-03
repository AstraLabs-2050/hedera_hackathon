"use client"
import Image from 'next/image'
import React from 'react'
import Input from '../components/input'
import Button from '../components/button'
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { baseSepolia, base, ethereum } from "thirdweb/chains";
import { inAppWallet } from "thirdweb/wallets";

function Page() {
  // Create the thirdweb client
  const client = createThirdwebClient({
    clientId: "64dafda6d4076a59a05be068bb7c9179"
  });

  // Set up your wallet options
  const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google",
          "x",
          "apple",
          "discord",
          "coinbase",
          "wallet",
          "facebook",
          "email",
          "phone",
          "passkey",
          "guest"
        ]
      }
    })
  ];

  // The contract address (use the one from your documents)
  const account = useActiveAccount();

  return (
    <div
      className='w-screen h-screen flex items-center justify-center'
      style={{
        backgroundImage: 'url("/loginBg.png")'
      }}
    >
      <div className='w-[516px] h-auto rounded-[16px] border border-[#000000] py-[24px] px-[40px] gap-[10px] flex flex-col items-center justify-center bg-white'>
        <Image className='mb-2' src="/logo.png" alt="logo" width={155} height={37} />
        <h2 className='font-[ClashGrotesk-Medium] font-[500] text-[32px]'>Your Digital Wallet</h2>
        <p className='text-[400] text-[18px]'>Create an account to launch your fashion collections</p>
        <Input disabled showCopyButton value={account ? account.address : ""} />
        <ConnectButton
          client={client}
          chain={baseSepolia} // Change this to match your contract deployment
          wallets={wallets}
        />
        <div className='bg-[#f3f4f6] border mb-3 border-[#BDBDBD] rounded-[16px] w-full p-[16px]'>
          <div className='flex gap-1 items-center'>
            <Image src="/privacy_tip.png" width={20} height={20} alt="privacy" />
            <p className='font-[ClashGrotesk-Semibold] font-[500] text-[12px]'>Wallet Security</p>
          </div>
          <ul className='text-[#828282] text-[12px] list-disc ml-6'>
            <li>Automatically generated with advanced encryption</li>
            <li>Private keys stored securely</li>
            <li>Two-factor authentication enabled</li>
          </ul>
        </div>
        <Button label='Continue' />
      </div>
    </div>
  )
}

export default Page