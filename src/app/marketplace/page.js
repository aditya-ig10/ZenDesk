'use client'

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import Image from 'next/image';
import logo from '../logo.png';
import NavLinks from '../components/NavLinks';

// Styled components
const Container = styled(motion.div)`
  min-height: 100vh;
  color: white;
  font-family: 'Poppins', sans-serif;
  position: relative;
  z-index: 2;
  background: linear-gradient(to bottom, #0a0015, #1a0030);
`;

const Header = styled(motion.header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 3rem;
  background-color: rgba(10, 0, 21, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Logo = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: bold;
`;

const MainContent = styled(motion.main)`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #ff4d6d, #4d79ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Toggle = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const NFTCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MarketplacePage() {
  const [mode, setMode] = useState('buy');
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      const response = await fetch('/api/getNFTs');
      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }
      const data = await response.json();
      setNfts(data);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('Failed to fetch NFTs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNFT = async (tokenId) => {
    try {
      const response = await fetch('/api/buyNFT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId }),
      });
      if (!response.ok) {
        throw new Error('Failed to buy NFT');
      }
      // Refresh NFTs after purchase
      fetchNFTs();
    } catch (error) {
      console.error('Error buying NFT:', error);
      setError('Failed to buy NFT. Please try again later.');
    }
  };

  const handleSellNFT = async (tokenId, price) => {
    try {
      const response = await fetch('/api/sellNFT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenId, price }),
      });
      if (!response.ok) {
        throw new Error('Failed to sell NFT');
      }
      // Refresh NFTs after listing
      fetchNFTs();
    } catch (error) {
      console.error('Error selling NFT:', error);
      setError('Failed to sell NFT. Please try again later.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <Logo
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Image src={logo} alt="Zendesk" width={180} height={55} />
        </Logo>
        <NavLinks />
      </Header>
      <MainContent>
        <Title variants={itemVariants}>NFT Marketplace</Title>
        <Toggle>
          <CustomButton onClick={() => setMode('buy')} active={mode === 'buy'}>Buy NFTs</CustomButton>
          <CustomButton onClick={() => setMode('sell')} active={mode === 'sell'}>Sell NFTs</CustomButton>
        </Toggle>
        
        <Card variants={itemVariants}>
          <h2>{mode === 'buy' ? 'Available NFTs' : 'Your NFTs'}</h2>
          <NFTGrid>
            {nfts.map((nft) => (
              <NFTCard key={nft.tokenId}>
                <Image 
                  src={nft.image} 
                  alt={nft.name} 
                  width={150} 
                  height={150} 
                />
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
                {mode === 'buy' ? (
                  <CustomButton onClick={() => handleBuyNFT(nft.tokenId)}>Buy</CustomButton>
                ) : (
                  <CustomButton onClick={() => handleSellNFT(nft.tokenId, nft.price)}>Sell</CustomButton>
                )}
              </NFTCard>
            ))}
          </NFTGrid>
        </Card>
      </MainContent>
    </Container>
  );
}