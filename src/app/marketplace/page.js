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
import ZendeskNFTABI from '../../../contracts/ZendeskNFT.json';

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

const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.p`
  color: #ff4d6d;
  text-align: center;
  margin-top: 20px;
`;

export default function MarketplacePage() {
  const router = useRouter();
  const [nfts, setNFTs] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setProvider(provider);
          setSigner(signer);
          setWalletAddress(address);
          localStorage.setItem('connectedAddress', address);
          fetchNFTs();
        } catch (error) {
          console.error('Error connecting to Metamask:', error);
          setError('Failed to connect to Metamask. Please try again.');
        }
      } else {
        setError('Metamask not detected. Please install Metamask to use this application.');
      }
    };

    connectWallet();
  }, []);

  const fetchNFTs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nfts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNFTs(data.nfts);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setError('Failed to fetch NFTs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (tokenId, price) => {
    try {
      if (!signer) {
        throw new Error('Wallet not connected');
      }
      
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_ZENDESK_NFT_CONTRACT_ADDRESS, ZendeskNFTABI.abi, signer);

      const tx = await contract.purchaseNFT(tokenId, { value: ethers.utils.parseEther(price) });
      await tx.wait();

      alert('NFT purchased successfully!');
      fetchNFTs();
      
      // Store purchased NFT info in localStorage
      const purchasedNFTs = JSON.parse(localStorage.getItem('purchasedNFTs') || '[]');
      purchasedNFTs.push({ tokenId, price });
      localStorage.setItem('purchasedNFTs', JSON.stringify(purchasedNFTs));
      
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
        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <NFTGrid>
            {nfts.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onPurchase={() => handlePurchase(nft.tokenId, nft.price)}
              />
            ))}
          </NFTGrid>
        )}
      </MainContent>
    </Container>
  );
}