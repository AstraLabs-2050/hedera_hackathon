// import { createThirdwebClient } from "thirdweb";

// export const client = createThirdwebClient({
//   clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
//   secretKey: process.env.THIRDWEB_SECRET_KEY || "",
// });

import { createThirdwebClient } from "thirdweb"

export const client = createThirdwebClient({
 clientId: "64dafda6d4076a59a05be068bb7c9179",
})

import { inAppWallet } from "thirdweb/wallets";

// export const client = createThirdwebClient({
//   clientId: "64dafda6d4076a59a05be068bb7c9179"
// });

export const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "x",
        "apple",
        "discord",
        "coinbase",
        "wallet",
        "facebook",
        "email",
        "phone",
        "passkey",
        "guest"
      ]
    }
  })
];