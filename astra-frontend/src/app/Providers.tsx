"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThirdwebProvider } from "thirdweb/react";
import { useState } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/userProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThirdwebProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThirdwebProvider>
  );
}
