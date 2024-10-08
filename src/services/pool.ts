import { cache } from "react"
import { unstable_cache } from "next/cache"

import { Pool } from "@/types/pool"

export const POOL_URL = "https://app.meteora.ag/clmm-api/pair"
export const ALL_POOLS_URL =
  "https://app.meteora.ag/clmm-api/pair/all_with_pagination?page=0&limit=20000&unknown=true&sort_key=feetvlratio&order_by=desc"

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
