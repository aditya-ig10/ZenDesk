import { OpenSeaSDK, Network } from 'opensea-js';
import { ethers } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const openSeaSDK = new OpenSeaSDK(provider, {
  networkName: Network.Sepolia,
  apiKey: process.env.OPENSEA_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tokenId } = req.body;

    try {
      const accountAddress = '0x...'; // Replace with the buyer's address
      const tokenAddress = process.env.ZENDESK_NFT_CONTRACT_ADDRESS;

      const order = await openSeaSDK.api.getOrder({
        asset_contract_address: tokenAddress,
        token_id: tokenId,
        side: 'ask',
      });

      const transactionHash = await openSeaSDK.fulfillOrder({ order, accountAddress });
      res.status(200).json({ success: true, transactionHash });
    } catch (error) {
      console.error('Error buying NFT:', error);
      res.status(500).json({ error: 'Failed to buy NFT' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}