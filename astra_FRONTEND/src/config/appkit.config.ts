import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hederaTestnet } from 'viem/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Astra Escrow Platform',
  projectId: '55f3460633909f29b9d6357098b912c5', // must be valid WalletConnect Cloud ID
  chains: [hederaTestnet],
  transports: {
    [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
  },
});
