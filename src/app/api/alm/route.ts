import { NextRequest, NextResponse } from 'next/server';
import { getAllPositions } from '@/lib/db';
import { runLiquidityManager } from '@/scripts/alm';
import { decryptPrivateKey } from '@/lib/wallet';

export const runtime = "nodejs"


export async function POST(req: NextRequest) {
      try {
        const positions = await getAllPositions();
  
        const results = await Promise.all(positions.map(async (position) => {
          const decryptedPrivateKey = decryptPrivateKey(position.encrypted_pk);
          
          const config = {
            userPrivateKey: decryptedPrivateKey,
            rpc: position.rpc,
            poolAddress: position.pool_address,
            token0: position.token0_address,
            token1: position.token1_address,
            totalBinRange: position.total_bin_range,
            rebalanceSlippage: position.rebalance_slippage,
            poolSlippage: position.pool_slippage,
            rebalanceMaxAttempts: position.rebalance_max_attempts,
            addLiquidityMaxAttempts: position.add_liquidity_max_attempts,
            removeLiquidityMaxAttempts: position.remove_liquidity_max_attempts,
          };
  
          return runLiquidityManager(config);
        }));
  
        return NextResponse.json({ results });
      } catch (error) {
        console.error('Error running liquidity managers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
  }