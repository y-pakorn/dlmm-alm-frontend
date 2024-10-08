export interface Pool {
  address: string
  name: string
  mint_x: string
  mint_y: string
  reserve_x: string
  reserve_y: string
  reserve_x_amount: number
  reserve_y_amount: number
  bin_step: number
  base_fee_percentage: string
  max_fee_percentage: string
  protocol_fee_percentage: string
  liquidity: string
  reward_mint_x: string
  reward_mint_y: string
  fees_24h: number
  today_fees: number
  trade_volume_24h: number
  cumulative_trade_volume: string
  cumulative_fee_volume: string
  current_price: number
  apr: number
  apy: number
  farm_apr: number
  farm_apy: number
  hide: boolean
}

export interface PoolSearch {
  pool_address: string
  pool_token_mints: string[]
  pool_token_amounts: string[]
  pool_token_usd_amounts: string[]
  lp_mint: string
  pool_tvl: string
  farm_tvl: string
  farming_pool: any
  farming_apy: string
  is_monitoring: boolean
  pool_order: number
  farm_order: number
  pool_version: number
  pool_name: string
  lp_decimal: number
  farm_reward_duration_end: number
  farm_expire: boolean
  pool_lp_price_in_usd: string
  trading_volume: number
  fee_volume: number
  weekly_trading_volume: number
  weekly_fee_volume: number
  yield_volume: string
  accumulated_trading_volume: string
  accumulated_fee_volume: string
  accumulated_yield_volume: string
  trade_apy: string
  weekly_trade_apy: string
  daily_base_apy: string
  weekly_base_apy: string
  farm_new: boolean
  permissioned: boolean
  unknown: boolean
  total_fee_pct: string
  is_lst: boolean
  is_forex: boolean
  created_at: number
  is_meme: boolean
  pool_type: string
}

export interface UserPool {
  pool: Pool
  total_bin_range: number
  rpc: string
  rebalance_slippage: number
  pool_slippage: number
  rebalance_max_attempts: number
  add_liquidity_max_attempts: number
  remove_liquidity_max_attempts: number
  public_key: string
  updated_at: Date
  created_at: Date
}
