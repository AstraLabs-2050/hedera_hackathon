// // config.ts
// import { getDefaultWallets, getDefaultConfig } from '@rainbow-me/rainbowkit';
// import { http } from 'wagmi';
// import { hederaTestnet } from 'viem/chains';

// // Declaration merging for TypeScript
// declare module 'wagmi' {
//   interface Register {
//     config: typeof config
//   }
// }


// // WalletConnect Project ID
// const projectId = '55f3460633909f29b9d6357098b912c5';

// // Get default wallets
// // const { wallets } = getDefaultWallets({
// //   appName: 'Astra Escrow Platform',
// //   projectId,
// // });

// // Create the config
// export const config = getDefaultConfig({
//   appName: 'Astra Escrow Platform',
//   projectId: projectId,
//   chains: [hederaTestnet],
//   transports: {
//     [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
//   },
//   // Use the wallets from getDefaultWallets
//   // wallets,
// });


// src/app/config.ts

'use client';
import { http } from "wagmi";
import { hederaTestnet } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "Astra Escrow Platform",
  projectId: "55f3460633909f29b9d6357098b912c5",
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http("https://testnet.hashio.io/api"),
  },
});
