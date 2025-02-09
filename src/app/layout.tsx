import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import Providers from "@/components/Providers";
import {Toaster} from "react-hot-toast"

export const metadata: Metadata = {
  title: "ChatPDF"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Providers>
        <html lang="en"> 
          <body
            suppressHydrationWarning 
            // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            {children}
        <Toaster/>
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
