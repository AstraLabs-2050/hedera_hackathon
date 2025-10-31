// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "./font.css";
import Notification from "./components/notification";
import Providers from "./Providers"; // 👈 use the wrapper
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Astra Brand",
  description: "Astra Brand",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={poppins.variable}>
      <body className='antialiased'>
        <Providers>{children}</Providers>
        <Notification.ToastContainer />
        <Toaster position='top-right' richColors />
      </body>
    </html>
  );
}
