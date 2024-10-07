"use server"

import { unstable_cache } from "next/cache"

import { Token } from "@/types/token"

export const getTokens = unstable_cache(
  async () => {
    const response = await fetch(
      `https://tokens.jup.ag/tokens?tags=verified,community,clone,pump,lst,birdeye-trending,strict`,
      {
        mode: "no-cors",
      }
    )
    return (await response.json()) as Token[]
  },
  ["tokens"],
  {
    revalidate: 600,
  }
)
