"use client"

import useUmiStore from "@/store/useUmiStore"
import { fetchMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { publicKey } from "@metaplex-foundation/umi"
import useSWR from "swr/immutable"

import { cn } from "@/lib/utils"
import { useToken } from "@/hooks/useTokens"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

const TokenAvatar = ({
  address,
  className,
}: {
  address: string
  className?: string
}) => {
  const token = useToken(address)

  return (
    <Avatar className={cn("size-6", className)}>
      <AvatarImage
        src={
          token?.logoURI
            ? `https://wsrv.nl/?w=48&h=48&url=${encodeURIComponent(token.logoURI)}`
            : undefined
        }
        alt={token?.symbol}
      />
      <AvatarFallback>
        {token?.symbol?.slice(2).toUpperCase() || "?"}
      </AvatarFallback>
    </Avatar>
  )
}
TokenAvatar.displayName = "TokenAvatar"

export { TokenAvatar }
