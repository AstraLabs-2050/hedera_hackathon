// // 'use client';

// import type { Metadata } from "next";
// import "./globals.css";
// import "./font.css";
// import Notification, { ToastContainer } from "./components/notification";
// import Providers from "./Providers";
// import { Poppins } from "next/font/google";
// import { AuthProvider } from "@/contexts/AuthContext"; // ✅ import your AuthProvider

// const poppins = Poppins({
//   weight: ["400", "600", "700"],
//   subsets: ["latin"],
//   variable: "--font-poppins",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "Astra",
//   description: "Astra Brand",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" className={poppins.variable}>
//       <body className="antialiased dark">
//         {/* ✅ Wrap everything in AuthProvider */}
//         <AuthProvider>
//           <Providers>{children}</Providers>
//           <ToastContainer />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import "./globals.css";
import "./font.css";
import Notification, { ToastContainer } from "./components/notification";
import Providers from "./Providers";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeWrapper from "./ThemeWrapper"; // 👈 new component

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Astra",
  description: "Astra Brand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased">
        <AuthProvider>
          <Providers>
            {/* 👇 Handles conditional dark mode */}
            <ThemeWrapper>{children}</ThemeWrapper>
          </Providers>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
