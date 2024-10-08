"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import ThemeSwitcher from "./themeSwitcher"

const WalletMultiButtonDynamic = dynamic(
  async () => await import("@/components/walletButton"),
  {
    ssr: false,
    loading: () => (
      <Loader2 className="mx-14 size-6 animate-spin self-center" />
    ),
  }
)

const Header = () => {
  return (
    <div className="z-10 mb-4 mt-2 w-full items-center justify-between text-sm lg:flex">
      <Link href="/">
        <h1 className="text-xl font-bold">Automated Liquidity Manager</h1>
      </Link>
      <div className="flex w-full items-end justify-center gap-4 pt-4 lg:static lg:size-auto lg:bg-none lg:pt-0">
        <WalletMultiButtonDynamic />
        <ThemeSwitcher />
      </div>
    </div>
  )
}

export default Header
