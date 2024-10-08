import { NextRequest, NextResponse } from "next/server"

import { createPosition, getAllPositions, getUserPositions } from "@/lib/db"
import {
  encryptPrivateKey,
  generatePrivateKeyFromAddresses,
} from "@/lib/wallet"

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address")
    let positions

    if (typeof address === "string") {
      positions = await getUserPositions(address)
    } else {
      positions = await getAllPositions()
    }

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      user_address,
      pool_address,
      token0_address,
      token1_address,
      total_bin_range,
      rebalance_slippage,
      pool_slippage,
    } = await req.json()

    // Generate and encrypt private key
    const privateKey = generatePrivateKeyFromAddresses([
      user_address,
      pool_address,
    ])
    const encrypted_pk = encryptPrivateKey(privateKey.secretKey)

    // Hard-coded values
    const rpc = "https://api.mainnet-beta.solana.com" // Replace with your preferred RPC endpoint
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

    return NextResponse.json({ id: result.id }, { status: 201 })
  } catch (error) {
    console.error("Error creating position:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
