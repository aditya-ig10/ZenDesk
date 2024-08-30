import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const response = await axios.get('https://api.opensea.io/api/v1/assets', {
        params: {
          order_direction: 'desc',
          offset: '0',
          limit: '20'
        },
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY
        }
      });

      const nfts = response.data.assets.map(asset => ({
        tokenId: asset.token_id,
        name: asset.name,
        description: asset.description,
        image: asset.image_url,
        contractAddress: asset.asset_contract.address,
        price: asset.last_sale ? asset.last_sale.total_price : null
      }));

      res.status(200).json(nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}