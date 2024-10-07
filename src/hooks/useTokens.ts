"use client"

import { useMemo } from "react"
import { unstable_cache } from "next/cache"
import { getTokens } from "@/services/token"
import useSWR from "swr/immutable"

import { Token } from "@/types/token"

export const useTokens = () => {
  const data = useSWR<Token[]>("tokens", async () => getTokens())

  return data
}

export const useToken = (address: string) => {
  const tokens = useTokens()
  const data = useMemo(
    () => tokens.data?.find((token) => token.address === address),
    [tokens, address]
  )

  return data
}
