import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

import { Plus_Jakarta_Sans } from 'next/font/google'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import Crumbs from "@/components/crumbs";

const JkSans = Plus_Jakarta_Sans({ subsets: ['latin'] })


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GUI Stream Station",
  description: "GUI for Stream Station Renaissiance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <div vaul-drawer-wrapper="" className="bg-background">

          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* FOR VAUL */}
            <SidebarProvider>
              <AppSidebar />
              <main className="max-w-full w-full">
                {/* <SidebarTrigger /> */}
                <div className='flex flex-row gap-1.5 align-middle items-center snap-start snap-always sticky top-0 px-2 py-3 glassmorphic z-50'>
                  <SidebarTrigger />
                  <Crumbs />
                </div>
                {children}
              </main>
              <Toaster richColors />
            </SidebarProvider>

          </ThemeProvider>
        </div>

      </body>
    </html>
  );
}
