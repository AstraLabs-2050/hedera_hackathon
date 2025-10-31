"use client";

import { FC, useState } from "react";
import { X, ArrowRight, Mail } from "lucide-react";
import Image from "next/image";
import ConnectWalletModal from "./blockChain";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false);

  const handleOpenWalletConnectModal = () => {
    setIsWalletConnectModalOpen(true);
  };

  const handleCloseWalletConnectModal = () => {
    setIsWalletConnectModalOpen(false);
  };

  const handleWalletConnect = (walletName: string) => {
    setIsWalletConnectModalOpen(false);
    // --- Your blockchain API integration logic will go here ---
    // For example, if walletName is 'Metamask', you would use your
    // blockchain SDK to initiate the connection with Metamask.
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-8">
      <div className=" bg-white w-[30%] rounded-2xl shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-center font-medium text-gray-600 mb-4">
          Login or sign up
        </h2>

        {/* Logo */}
        <div className="flex justify-center mb-6 py-20">
          <Image src="/logo.png" alt="ASTRA" width={100} height={30} />
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {["/google.png", "/apple.png", "/Socials.png", "/Socials (1).png"].map((provider) => (
            <button
              key={provider}
              className="border rounded-lg flex items-center justify-center p-2 hover:bg-gray-100"
            >
              <Image
                src={provider}
                alt="icons"
                width={24}
                height={24}
              />
            </button>
          ))}
        </div>

        {/* Email Login */}
        <div className="flex items-center border rounded-lg overflow-hidden mb-4">
          <div className="px-3 text-gray-400">
            <Mail size={18} />
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className=" block w-full px-2 py-6 focus:outline-none"
            placeholder="your@email.com                                       "
          />
          <button className=" px-2 py-2 text-gray-300">
            Submit
          </button>

        </div>

        {/* Wallet Connect */}
        <button
          onClick={handleOpenWalletConnectModal}
          className="w-full flex items-center justify-between border rounded-lg py-6 px-2 hover:bg-gray-100 transition mb-12"
        >
          <span className="flex gap-4 ">
            <Image src="/wallet-cards.png" alt="wallet-cards" width={15} height={15} />
            Sign in with wallet
          </span>
          <ArrowRight size={16} />
        </button>

        {/* Connect Wallet Modal */}
        <ConnectWalletModal
          isOpen={isWalletConnectModalOpen}
          onClose={handleCloseWalletConnectModal}
          onConnect={handleWalletConnect}
        />
      </div>
    </div>
  );
};

export default LoginModal;