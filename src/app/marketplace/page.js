'use client'

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../logo.png';
import { ethers } from 'ethers';
import NavLinks from '../components/NavLinks';
import NFTCard from '../components/NFTCard';
import ZendeskNFTABI from '../contracts/ZendeskNFT.json';

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
  cursor: pointer;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
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

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
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
  const router = useRouter();
  const [nfts, setNFTs] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const storedAddress = localStorage.getItem('connectedAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
      fetchNFTs();
    } else {
      router.push('/'); // Redirect to home if no wallet address is found
    }
  }, []);

  const fetchNFTs = async () => {
    try {
      const response = await fetch('/api/nfts');
      const data = await response.json();
      setNFTs(data.nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const handlePurchase = async (tokenId, price) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ZENDESK_NFT_CONTRACT_ADDRESS, ZendeskNFTABI.abi, signer);

      const tx = await contract.purchaseNFT(tokenId, { value: ethers.utils.parseEther(price) });
      await tx.wait();

      alert('NFT purchased successfully!');
      fetchNFTs(); // Refresh the NFT list
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      alert('Error purchasing NFT. Please try again.');
    }
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
          onClick={() => router.push('/home')}
        >
          <Image src={logo} alt="Zendesk" width={180} height={55} />
        </Logo>
        <Nav>
          <NavLinks />
        </Nav>
      </Header>
      <MainContent>
        <Title variants={itemVariants}>NFT Marketplace</Title>
        <NFTGrid>
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              nft={nft}
              onPurchase={() => handlePurchase(nft.tokenId, nft.price)}
            />
          ))}
        </NFTGrid>
      </MainContent>
    </Container>
  );
}