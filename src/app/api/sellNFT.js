import { OpenSeaSDK, Network } from 'opensea-js';
import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const openSeaSDK = new OpenSeaSDK(provider, {
  networkName: Network.Sepolia,
  apiKey: process.env.OPENSEA_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tokenId, price } = req.body;

    try {
      const accountAddress = '0x...'; // Replace with the seller's address
      const tokenAddress = process.env.ZENDESK_NFT_CONTRACT_ADDRESS;
      const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // 24 hours from now

      const listing = await openSeaSDK.createSellOrder({
        asset: {
          tokenId,
          tokenAddress,
        },
        accountAddress,
        startAmount: price,
        expirationTime,
      });

      res.status(200).json({ success: true, listing });
    } catch (error) {
      console.error('Error selling NFT:', error);
      res.status(500).json({ error: 'Failed to sell NFT' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}