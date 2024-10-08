import { z } from "zod"

export const createPositionSchema = z.object({
  total_bin_range: z.number(),
  rebalance_slippage: z.number(),
  pool_slippage: z.number(),
  rpc: z.string().url().optional(),
})
