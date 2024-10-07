import { NextApiRequest, NextApiResponse } from 'next';
import { createPosition, getUserPositions, getAllPositions } from '../../../lib/db';
import { encryptPrivateKey, generatePrivateKey } from '@/lib/wallet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
        const {
          user_address,
          pool_address,
          token0_address,
          token1_address,
          total_bin_range,
          rebalance_slippage,
          pool_slippage
        } = req.body;
  
        // Generate and encrypt private key
        const privateKey = generatePrivateKey();
        const encrypted_pk = encryptPrivateKey(privateKey);
  
        // Hard-coded values
        const rpc = 'https://api.mainnet-beta.solana.com'; // Replace with your preferred RPC endpoint
        const rebalance_max_attempts = 3;
        const add_liquidity_max_attempts = 3;
        const remove_liquidity_max_attempts = 3;
  
        const result = await createPosition(
          user_address,
          encrypted_pk,
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
        res.status(201).json({ id: result.id });
      } catch (error) {
        console.error('Error creating position:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  } else if (req.method === 'GET') {
    try {
      const { address } = req.query;
      let positions;

      if (typeof address === 'string') {
        positions = await getUserPositions(address);
      } else {
        positions = await getAllPositions();
      }

      res.status(200).json(positions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


