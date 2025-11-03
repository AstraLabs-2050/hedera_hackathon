import { ConnectButton } from "thirdweb/react";
import { baseSepolia, ethereum, polygonAmoy } from "thirdweb/chains";
import { client } from "../../../../../client";

import { inAppWallet, createWallet } from "thirdweb/wallets";
import { hederaTestnet } from "viem/chains";

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "discord",
        "telegram",
        "farcaster",
        "email",
        "x",
        "passkey",
        "phone",
      ],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.rabby"),
  createWallet("io.zerion.wallet"),
  createWallet("com.okex.wallet"),
  createWallet("com.binance.wallet"),
];

export default function Example() {
  return (
    <div className='scale-75 w-[150px] md:w-fit mr-auto overflow-x-hidden rounded-tr-lg rounded-br-lg'>
      {" "}
      {/* <ConnectButton
        client={client}
        connectButton={{
          label: "Connect Wallet",
          className:
            "border border-black text-black pr-0 bg-white rounded-full hover:bg-[#f8f8f8] transition w-[60px]",
        }}
        connectModal={{ size: "compact" }}
        wallets={wallets}
        chains={[baseSepolia, polygonAmoy, ethereum,]}
      /> */}

      
    </div>

    // <ConnectButton
    //   client={client}
    //   connectButton={{ label: "Connect Wallet" }}
    //   connectModal={{ size: "compact" }}
    //   wallets={wallets}
    //   chains={[baseSepolia, polygonAmoy, ethereum]} // ✅ put chains here
    // />
  );
}
