import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'collections') {
    return getCollections(request);
  } else {
    return getNFTs(request);
  }
}

async function getCollections(request) {
  try {
    console.log('Fetching collections from OpenSea...');
    const apiKey = process.env.OPENSEA_API_KEY;
    if (!apiKey) {
      console.error('OpenSea API key is missing');
      return NextResponse.json({ error: 'OpenSea API key is missing' }, { status: 500 });
    }

    console.log('Using API Key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5));

    const response = await axios.get('https://api.opensea.io/api/v1/collections', {
      params: {
        offset: 0,
        limit: 20,
      },
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log('OpenSea API Response Status for collections:', response.status);
    console.log('OpenSea API Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('OpenSea API Response Data for collections:', JSON.stringify(response.data, null, 2));

    if (!response.data.collections || response.data.collections.length === 0) {
      console.log('No collections returned from OpenSea API');
      return NextResponse.json({ collections: [] });
    }

    const collections = response.data.collections.map(collection => ({
      address: collection.primary_asset_contracts[0]?.address || 'Unknown',
      name: collection.name || 'Unnamed Collection',
      description: collection.description || 'No description available',
      image: collection.image_url || '',
      floorPrice: collection.stats?.floor_price || 'Unknown',
      totalVolume: collection.stats?.total_volume || 'Unknown',
    }));

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error fetching collections from OpenSea:', error.message);
    if (error.response) {
      console.error('OpenSea API Error Response:', error.response.data);
      console.error('OpenSea API Error Status:', error.response.status);
      console.error('OpenSea API Error Headers:', error.response.headers);
    } else if (error.request) {
      console.error('OpenSea API Request Error:', error.request);
    } else {
      console.error('OpenSea API Error:', error.message);
    }
    return NextResponse.json({ error: 'Error fetching collections', details: error.message }, { status: 500 });
  }
}

async function getNFTs(request) {
  try {
    console.log('Fetching NFTs from OpenSea...');
    const apiKey = process.env.OPENSEA_API_KEY;
    if (!apiKey) {
      console.error('OpenSea API key is missing');
      return NextResponse.json({ error: 'OpenSea API key is missing' }, { status: 500 });
    }

    const response = await axios.get('https://api.opensea.io/v2/orders/ethereum/seaport/listings', {
      params: {
        order_by: 'created_date',
        order_direction: 'desc',
        limit: 20,
      },
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });

    console.log('OpenSea API Response Status:', response.status);
    console.log('OpenSea API Response Data:', JSON.stringify(response.data, null, 2));

    if (!response.data.orders || response.data.orders.length === 0) {
      console.log('No orders returned from OpenSea API');
      return NextResponse.json({ nfts: [] });
    }

    const nfts = response.data.orders.map(order => {
      const asset = order.maker_asset_bundle.assets[0];
      const price = order.current_price;
      const symbol = order.taker_asset_bundle?.asset_contract?.symbol || 'ETH';

      return {
        tokenId: order.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria || 'Unknown',
        name: asset?.name || 'Unnamed NFT',
        description: asset?.description || 'No description available',
        image: asset?.image_url || '',
        price: `${price ? parseFloat(price) / 1e18 : 'Unknown'} ${symbol}`,
        collectionName: asset?.collection?.name || 'Unknown Collection',
      };
    });

    return NextResponse.json({ nfts });
  } catch (error) {
    console.error('Error fetching NFTs from OpenSea:', error.message);
    if (error.response) {
      console.error('OpenSea API Error Response:', error.response.data);
      console.error('OpenSea API Error Status:', error.response.status);
      console.error('OpenSea API Error Headers:', error.response.headers);
    } else if (error.request) {
      console.error('OpenSea API Request Error:', error.request);
    } else {
      console.error('OpenSea API Error:', error.message);
    }
    return NextResponse.json({ error: 'Error fetching NFTs', details: error.message }, { status: 500 });
  }
}