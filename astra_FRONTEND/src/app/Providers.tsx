// "use client";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ThirdwebProvider } from "thirdweb/react";
// import { useState } from "react";
// import WagmiProviders from "./WagmiProvider";
// import { AuthProvider } from "@/contexts/AuthContext";

// export default function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//     <ThirdwebProvider >
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//           <WagmiProviders>{children}</WagmiProviders>
//           </AuthProvider>
//       </QueryClientProvider>
//     </ThirdwebProvider>
//   );
// }


// "use client";

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useState } from "react";
// import { WagmiProvider } from "wagmi";
// import { appkit, wagmiConfig } from "@/config/appkit.config";
// import { AuthProvider } from "@/contexts/AuthContext";

// export default function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(() => new QueryClient());

//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>{children}</AuthProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }


'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig } from '@/config/appkit.config';
import '@rainbow-me/rainbowkit/styles.css'; // ← important

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
