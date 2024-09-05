import axios from 'axios';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const response = await axios.get('https://api.opensea.io/api/v1/assets', {
          params: {
            order_direction: 'desc',
            offset: '0',
            limit: '20',
            // Add more parameters as needed
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
          price: asset.last_sale ? asset.last_sale.total_price : 'Not for sale',
          // Add more fields as needed
        }));

        res.status(200).json({ nfts });
      } catch (error) {
        console.error('Error fetching NFTs from OpenSea:', error);
        res.status(500).json({ error: 'Error fetching NFTs' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}