import React from 'react';
import Image from 'next/image';

interface Wallet {
  name: string;
  icon: string;
  installed?: boolean;
}

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletName: string) => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) {
    return null;
  }

  const wallets: Wallet[] = [
    { name: 'Metamask', icon: '/metamask.svg', installed: true },
    { name: 'Coinbase wallet', icon: '/coinbase.svg' },
    { name: 'Rainbow', icon: '/rainbow.svg' },
    { name: 'Gnosis', icon: '/gnosis.svg' },
    { name: 'Phantom', icon: '/phantom.svg' },
    { name: 'WalletConnect', icon: '/walletconnect.svg' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[30%] h-auto bg-white rounded-xl shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">Sign in with Wallet</h2>
        <div className="space-y-4 p-6">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              className="flex items-center w-full  px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => onConnect(wallet.name)}
            >
              <Image src={wallet.icon} alt={wallet.name} width={24} height={24} className="mr-3" />
              <span className="text-sm font-medium text-gray-700">{wallet.name}</span>
              {wallet.installed && <span className="ml-auto text-xs text-gray-500">Installed</span>}
            </button>
          ))}
          <button className="flex items-center w-full px-4 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-medium p-2 text-gray-700">All wallets</span>
            <svg className="ml-auto w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className=" border-t  py-6 px-4 border-gray-200 flex items-center justify-between   text-gray-500">
          <span>New to wallets?</span>
          <button className="text  font-semibold focus:outline-none ">Get Started</button>
          
        </div>
        
      </div>
    </div>
  );
};

export default ConnectWalletModal;