import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LoginScreen } from "@/components/LoginScreen";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Multi Model",
  description: "Use any AI model you please",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#2b2b2b]`}
        >
          <ClerkProvider>
            <SignedOut>
              <LoginScreen />
            </SignedOut>
            <SignedIn>
              <SidebarProvider>
                <AppSidebar />
                {children}
              </SidebarProvider>
            </SignedIn>
          </ClerkProvider>
        </body>
      </html>
  );
}
