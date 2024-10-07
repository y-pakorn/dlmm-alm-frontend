"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WalletButton = () => {
  return (
    <WalletMultiButton
      style={{
        fontFamily: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      }}
    />
  );
};

export default WalletButton;
