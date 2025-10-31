// import { createThirdwebClient } from "thirdweb";

// export const client = createThirdwebClient({
//   clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
//   secretKey: process.env.THIRDWEB_SECRET_KEY || "",
// });

import { createThirdwebClient, defineChain } from "thirdweb";

export const client = createThirdwebClient({
  clientId: "64dafda6d4076a59a05be068bb7c9179",
});

export const hederaTestnet = defineChain({
  id: 296,
  name: "Hedera Testnet",
  rpc: "https://296.rpc.thirdweb.com",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
});
