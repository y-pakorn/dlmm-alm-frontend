import { sql } from '@vercel/postgres';

export async function createPosition(
  userAddress: string,
  encryptedPk: string,
  rpc: string,
  poolAddress: string,
  token0Address: string,
  token1Address: string,
  totalBinRange: number,
  rebalanceSlippage: number,
  poolSlippage: number,
  rebalanceMaxAttempts: number,
  addLiquidityMaxAttempts: number,
  removeLiquidityMaxAttempts: number
) {
  try {
    const result = await sql`
      INSERT INTO positions (
        user_address, encrypted_pk, rpc, pool_address, token0_address, token1_address,
        total_bin_range, rebalance_slippage, pool_slippage, rebalance_max_attempts,
        add_liquidity_max_attempts, remove_liquidity_max_attempts
      ) VALUES (
        ${userAddress}, ${encryptedPk}, ${rpc}, ${poolAddress}, ${token0Address}, ${token1Address},
        ${totalBinRange}, ${rebalanceSlippage}, ${poolSlippage}, ${rebalanceMaxAttempts},
        ${addLiquidityMaxAttempts}, ${removeLiquidityMaxAttempts}
      ) RETURNING id;
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Failed to create position:', error);
    throw error;
  }
}

export async function getAllPositions() {
  try {
    const result = await sql`SELECT * FROM positions;`;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    throw error;
  }
}

export async function getUserPositions(userAddress: string) {
  try {
    const result = await sql`SELECT * FROM positions WHERE user_address = ${userAddress};`;
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch positions:', error);
    throw error;
  }
}
