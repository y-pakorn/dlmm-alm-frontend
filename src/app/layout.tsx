import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProviderWrapper } from "@/providers/themeProvider"
import { WalletAdapterProvider } from "@/providers/walletAdapterProvider"

import "./globals.css"

import { UmiProvider } from "@/providers/umiProvider"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DLMM ALM",
  description: "Automated Liquidity Management for DLMM",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", inter.className)}>
        <WalletAdapterProvider>
          <UmiProvider>
            <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
          </UmiProvider>
        </WalletAdapterProvider>
        <Toaster />
      </body>
    </html>
  )
}
