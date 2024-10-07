import { cache } from "react"
import { unstable_cache } from "next/cache"

import { Pool } from "@/types/pool"

export const ALL_POOLS_URL =
  "https://app.meteora.ag/amm/pools/search?page=0&size=20000&sort_key=fee_tvl_ratio&order_by=desc"

export const getRawPools = unstable_cache(
  async () => {
    const response = await fetch(ALL_POOLS_URL)
    return (await response.json()) as Pool[]
  },
  ["rawPools"],
  {
    revalidate: 600, // 10 minutes
  }
)

export const getPools = cache(async () => {
  const pools = await getRawPools()

  return pools
})
