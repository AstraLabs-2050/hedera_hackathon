"use client";

import React, { useEffect, useState } from "react";
import {
  Copy,
  Check,
  Shield,
  Wallet,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Loader from "@/app/components/common/Loader";

export default function WalletPage() {
  const [copied, setCopied] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Get wallet address from user object
  const walletAddress = user?.walletAddress;

  const copyToClipboard = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = walletAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    console.log("Auth loading:", isLoading, "User:", user);
    console.log("Wallet Address:", walletAddress);
  }, []);

  const handleContinue = () => {
    router.push("/register/welcome");
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    if (showFullAddress) return address;
    return `${address.slice(0, 10)}...${address.slice(-4)}`;
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md space-y-8'>
          <div className='bg-white rounded-2xl border border-gray-400 p-8 shadow-lg text-center'>
            <Loader />
            <h2 className='text-xl font-semibold mb-2'>
              Setting up your wallet
            </h2>
            <p className='text-gray-600'>
              Please wait while we prepare your digital wallet...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state - no wallet address
  if (!walletAddress) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='w-full max-w-md space-y-8'>
          <div className='bg-white rounded-2xl border border-gray-200 p-8 shadow-lg text-center'>
            <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2 text-gray-900'>
              Wallet Setup Error
            </h2>
            <p className='text-gray-600 mb-6'>
              We couldn&apos;t set up your wallet. Please try refreshing the
              page or contact support.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className='w-full bg-black hover:bg-gray-800 h-10 text-white rounded-full'>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='bg-white rounded-2xl border border-gray-200 p-8 shadow-lg'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-32 mx-auto mb-6'>
              <Image
                src='/astraLogo.svg'
                alt='Astra brand logo'
                className='w-full h-auto'
                width={120}
                height={30}
                priority
              />
            </div>
            <div className='bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
              <Wallet className='h-8 w-8 text-white' />
            </div>
            <h2 className='text-lg font-bold text-gray-900 mb-2'>
              Your Digital Wallet
            </h2>
            <p className='text-gray-600'>
              Securely generated and ready for blockchain transactions
            </p>
          </div>

          {/* Wallet Address Section */}
          <div className='space-y-6'>
            <div className='bg-gray-50 rounded-xl px-4 py-[5px] border-2 border-dashed border-gray-200'>
              <div className='flex items-center justify-between'>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
                    Wallet Address
                  </p>
                  <button
                    onClick={() => setShowFullAddress(!showFullAddress)}
                    className='text-sm font-mono text-gray-900 hover:text-black transition-colors'
                    title='Click to toggle full address'>
                    {formatWalletAddress(walletAddress)}
                  </button>
                </div>
                <button
                  onClick={copyToClipboard}
                  className='ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors'
                  title={copied ? "Copied!" : "Copy wallet address"}>
                  {copied ? (
                    <Check className='h-4 w-4 text-green-600' />
                  ) : (
                    <Copy className='h-4 w-4' />
                  )}
                </button>
              </div>
              {copied && (
                <p className='text-xs text-green-600 mt-2 font-medium'>
                  ✓ Wallet address copied to clipboard!
                </p>
              )}
            </div>

            {/* Security Features */}
            <div className='bg-blue-50 rounded-xl p-4 border border-blue-200'>
              <div className='flex items-start space-x-3'>
                <Shield className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                <div>
                  <h3 className='text-sm font-semibold text-blue-900 mb-2'>
                    Security Features
                  </h3>
                  <ul className='text-xs text-blue-800 space-y-1'>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mr-2'></div>
                      End-to-end encryption
                    </li>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mr-2'></div>
                      Secure key management
                    </li>
                    <li className='flex items-center'>
                      <div className='w-1.5 h-1.5 bg-blue-600 rounded-full mr-2'></div>
                      Multi-signature support
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className='bg-gray-50 rounded-xl p-4'>
              <h3 className='text-sm font-semibold text-gray-900 mb-2'>
                What&apos;s Next?
              </h3>
              <p className='text-xs text-gray-600 mb-3'>
                Your wallet is ready for NFT minting, marketplace transactions,
                and receiving payments.
              </p>
              <div className='flex items-center text-xs text-gray-500'>
                <ExternalLink className='h-3 w-3 mr-1' />
                <span>Learn more about wallet security</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className='w-full bg-black hover:bg-gray-800 h-12 text-white py-3 rounded-full mt-8 transition-colors duration-200'>
            Continue to Welcome
          </Button>

          {/* Progress Indicator */}
          <div className='text-center mt-6'>
            <p className='text-xs text-gray-500 mb-2'>
              Step 3 of 4 - Wallet setup complete
            </p>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-black h-2 rounded-full transition-all duration-500'
                style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
