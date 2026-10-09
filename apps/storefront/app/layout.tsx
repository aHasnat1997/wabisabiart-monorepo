import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Modals from "@/components/modal";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import { GoogleOAuthProvider } from "@react-oauth/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WabiSabiArt - Shop Smarter Online",
  description:
    "Great deals on fashion, electronics, and more. Fast delivery and secure payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tw-animate-css@1.4.0/index.css"
        />
      </head>
      <body className={dmSans.variable}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <Providers>
            {children}

            <Toaster />

            <Suspense fallback={null}>
              <Modals />
            </Suspense>
          </Providers>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
