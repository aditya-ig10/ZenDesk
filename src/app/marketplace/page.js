'use client'

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import logo from '../logo.png';
import NavLinks from '../components/NavLinks';

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

const ToggleButton = styled(motion.button)`
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border: 2px solid white;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const NFTGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const NFTCard = styled(motion.div)`
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

// Sample NFT data
const sampleNFTs = [
  { id: 1, name: "Cosmic Voyage #1", price: 0.5, image: "/api/placeholder/250/250", artist: "Stella Nova" },
  { id: 2, name: "Digital Dreams #42", price: 0.8, image: "/api/placeholder/250/250", artist: "Pixel Master" },
  { id: 3, name: "Neon Nights #7", price: 1.2, image: "/api/placeholder/250/250", artist: "Glow Wizard" },
  { id: 4, name: "Abstract Realms #23", price: 0.6, image: "/api/placeholder/250/250", artist: "Brush Whisperer" },
  { id: 5, name: "Cyber Punk Portrait #3", price: 1.5, image: "/api/placeholder/250/250", artist: "Neon Picasso" },
  { id: 6, name: "Ethereal Landscapes #11", price: 0.9, image: "/api/placeholder/250/250", artist: "Dream Weaver" },
];

export default function MarketplacePage() {
  const [mode, setMode] = useState('buy');

  const handleAction = (nft) => {
    console.log(`${mode === 'buy' ? 'Buying' : 'Selling'} NFT:`, nft);
    // Here you would typically handle the buy/sell action
  };

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
          <ToggleButton
            onClick={() => setMode('buy')}
            active={mode === 'buy'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Buy NFTs
          </ToggleButton>
          <ToggleButton
            onClick={() => setMode('sell')}
            active={mode === 'sell'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sell NFTs
          </ToggleButton>
        </Toggle>
        
        <Card variants={itemVariants}>
          <h2>{mode === 'buy' ? 'Available NFTs' : 'Your NFTs'}</h2>
          <NFTGrid
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {sampleNFTs.map((nft) => (
                <NFTCard
                  key={nft.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image src={nft.image} alt={nft.name} width={200} height={200} />
                  <h3>{nft.name}</h3>
                  <p>by {nft.artist}</p>
                  <p>{nft.price} ETH</p>
                  <ToggleButton
                    onClick={() => handleAction(nft)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mode === 'buy' ? 'Buy' : 'Sell'}
                  </ToggleButton>
                </NFTCard>
              ))}
            </AnimatePresence>
          </NFTGrid>
        </Card>
      </MainContent>
    </Container>
  );
}