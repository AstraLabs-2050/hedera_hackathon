"use client";

import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client, hederaTestnet } from "@/client";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

export default function WalletConnectButton() {
  return (
    <div className='scale-75 w-[150px] md:w-fit mr-auto overflow-x-hidden rounded-tr-lg rounded-br-lg'>
      <ConnectButton
        client={client}
        wallets={wallets}
        chains={[hederaTestnet]}
        connectModal={{ size: "compact" }}
        connectButton={{
          label: "Connect Wallet",
          className:
            "border border-black text-black pr-0 bg-white rounded-full hover:bg-[#f8f8f8] transition w-[60px]",
        }}
      />
    </div>
  );
}
