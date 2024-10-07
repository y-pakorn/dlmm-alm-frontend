"use client";

import dynamic from "next/dynamic";
import ThemeSwitcher from "./themeSwitcher";
import { Loader2 } from "lucide-react";

const WalletMultiButtonDynamic = dynamic(
  async () => await import("@/components/walletButton"),
  {
    ssr: false,
    loading: () => (
      <Loader2 className="animate-spin size-6 self-center mx-14" />
    ),
  }
);

const Header = () => {
  return (
    <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
      <h1 className="text-xl font-bold">Automated Liquidity Manager</h1>
      <div className="flex pt-4 lg:pt-0 w-full items-end justify-center gap-4 lg:static lg:size-auto lg:bg-none">
        <WalletMultiButtonDynamic />
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Header;
