'use client';

import { useState } from 'react';
import { WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    RainbowKitProvider,
    getDefaultConfig
} from '@rainbow-me/rainbowkit';
import { hederaTestnet } from 'viem/chains';

 // ✅ Create combined Wagmi + RainbowKit config
const config = getDefaultConfig({
    appName: 'Astra Escrow Platform',
    projectId: '55f3460633909f29b9d6357098b912c5',
    chains: [hederaTestnet],
    transports: {
        [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
    },
});

export default function WagmiProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

// 'use client';

// import { useState } from 'react';
// import { WagmiProvider, http } from 'wagmi';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import {
//   RainbowKitProvider,
//   getDefaultConfig
// } from '@rainbow-me/rainbowkit';
// import { hederaTestnet } from '@/config/hederaTestnet';

// // ✅ Create combined Wagmi + RainbowKit config
// const config = getDefaultConfig({
//   appName: 'Astra Escrow Platform',
//   projectId: '55f3460633909f29b9d6357098b912c5',
//   chains: [hederaTestnet],
//   transports: {
//     [hederaTestnet.id]: http('https://testnet.hashio.io/api'),
//   },
// });

// export default function WagmiProviders({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider>
//           {children}
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }
