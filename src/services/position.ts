"use server"

import { createPosition, getUserPositions } from "@/lib/db"
import {
  encryptPrivateKey,
  generatePrivateKeyFromAddresses,
} from "@/lib/wallet"

export const getAllUserPositions = async (address: string) => {
  return await getUserPositions(address)
}

export const getPositionPublicKey = async (
  user_address: string,
  pool_address: string
) => {
  return generatePrivateKeyFromAddresses([user_address, pool_address]).publicKey
}

export const createUserPosition = async ({
  pool_address,
  pool_slippage,
  rebalance_slippage,
  token0_address,
  token1_address,
  total_bin_range,
  user_address,
  rpc,
}: {
  user_address: string
  pool_address: string
  token0_address: string
  token1_address: string
  total_bin_range: number
  rebalance_slippage: number
  pool_slippage: number
  rpc?: string
}) => {
  // Generate and encrypt private key
  const privateKey = generatePrivateKeyFromAddresses([
    user_address,
    pool_address,
  ])
  const encrypted_pk = encryptPrivateKey(privateKey.secretKey)

  // Hard-coded values
  rpc = rpc || "https://api.mainnet-beta.solana.com" // Replace with your preferred RPC endpoint
  const rebalance_max_attempts = 3
  const add_liquidity_max_attempts = 3
  const remove_liquidity_max_attempts = 3

  const result = await createPosition(
    user_address,
    encrypted_pk,
    privateKey.publicKey,
    rpc,
    pool_address,
    token0_address,
    token1_address,
    total_bin_range,
    rebalance_slippage,
    pool_slippage,
    rebalance_max_attempts,
    add_liquidity_max_attempts,
    remove_liquidity_max_attempts
  )

  return result.id
}
