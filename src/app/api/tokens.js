import { connectToDatabase } from '../../utils/dbConnect';
import axios from 'axios';

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

async function pinJSONToIPFS(JSONBody) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  
  try {
    const response = await axios.post(url, JSONBody, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      }
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  let db;
  try {
    db = await connectToDatabase();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to the database' });
  }

  if (req.method === 'GET') {
    try {
      const user = await db.collection('users').findOne({ address: req.query.address });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        tokens: user.tokens || 0,
        adPerformance: user.adPerformance || { impressions: 0, clicks: 0, earnings: 0 },
        tokenHistory: user.tokenHistory || []
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else if (req.method === 'POST') {
    const { address, tokenData } = req.body;

    if (!address || !tokenData) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      // Pin data to IPFS
      const ipfsHash = await pinJSONToIPFS(tokenData);

      // Update database
      const result = await db.collection('users').updateOne(
        { address },
        { 
          $set: { 
            tokens: tokenData.tokens,
            adPerformance: tokenData.adPerformance,
            tokenHistory: tokenData.tokenHistory,
            ipfsHash: ipfsHash
          }
        },
        { upsert: true }
      );

      if (result.modifiedCount === 1 || result.upsertedCount === 1) {
        return res.status(200).json({ message: 'User data updated successfully', ipfsHash });
      } else {
        return res.status(500).json({ error: 'Failed to update user data' });
      }
    } catch (error) {
      console.error('Error in POST request:', error);
      return res.status(500).json({ error: 'Failed to update user data' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}