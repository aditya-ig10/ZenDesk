'use client'

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ethers } from 'ethers';
import axios from 'axios';
import logo from '../logo.png';
import NavLinks from '../components/navLinks';
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

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  border: 1px solid white;
  background: rgba(255, 255, 255, 0.1);
  color: white;
`;

const FileInput = styled.input`
  width: 100%;
  margin-bottom: 1rem;
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
  const [newNFT, setNewNFT] = useState({ name: '', description: '', price: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
      const contract = new ethers.Contract(process.env.ZENDESK_NFT_CONTRACT_ADDRESS, ZendeskNFTABI.abi, provider);
      const totalSupply = await contract.totalSupply();
      
      const fetchedNFTs = [];
      for (let i = 1; i <= totalSupply; i++) {
        const tokenURI = await contract.tokenURI(i);
        const response = await axios.get(tokenURI);
        const metadata = response.data;
        fetchedNFTs.push({
          id: i,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          price: ethers.utils.formatEther(await contract.getPrice(i))
        });
      }
      setNfts(fetchedNFTs);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const handleBuy = async (nft) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(process.env.ZENDESK_NFT_CONTRACT_ADDRESS, ZendeskNFTABI.abi, signer);
      
      const tx = await contract.buyNFT(nft.id, { value: ethers.utils.parseEther(nft.price) });
      await tx.wait();
      
      alert(`Successfully bought ${nft.name}!`);
      fetchNFTs();
    } catch (error) {
      console.error('Error buying NFT:', error);
      alert('Error buying NFT. Check console for details.');
    }
  };

  const handleCreateNFT = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!file) {
        alert('Please select an image file');
        return;
      }

      // Upload image to IPFS (Pinata)
      const formData = new FormData();
      formData.append('file', file);
      const resFile = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
        },
      });
      const imageHash = `ipfs://${resFile.data.IpfsHash}`;

      // Create metadata
      const metadata = {
        name: newNFT.name,
        description: newNFT.description,
        image: imageHash,
      };

      // Upload metadata to IPFS
      const resMetadata = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
        headers: {
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
        },
      });
      const tokenURI = `ipfs://${resMetadata.data.IpfsHash}`;

      // Mint NFT
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(process.env.ZENDESK_NFT_CONTRACT_ADDRESS, ZendeskNFTABI.abi, signer);
      
      const tx = await contract.mintNFT(tokenURI, ethers.utils.parseEther(newNFT.price));
      await tx.wait();

      alert('NFT created successfully!');
      setNewNFT({ name: '', description: '', price: '' });
      setFile(null);
      fetchNFTs();
    } catch (error) {
      console.error('Error creating NFT:', error);
      alert('Error creating NFT. Check console for details.');
    } finally {
      setLoading(false);
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
            onClick={() => setMode('create')}
            active={mode === 'create'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create NFT
          </ToggleButton>
        </Toggle>
        
        {mode === 'buy' && (
          <Card variants={itemVariants}>
            <h2>Available NFTs</h2>
            <NFTGrid
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {nfts.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image src={nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} alt={nft.name} width={200} height={200} />
                    <h3>{nft.name}</h3>
                    <p>{nft.description}</p>
                    <p>{nft.price} ETH</p>
                    <ToggleButton
                      onClick={() => handleBuy(nft)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Buy
                    </ToggleButton>
                  </NFTCard>
                ))}
              </AnimatePresence>
            </NFTGrid>
          </Card>
        )}

        {mode === 'create' && (
          <Card variants={itemVariants}>
            <h2>Create New NFT</h2>
            <form onSubmit={handleCreateNFT}>
              <Input
                type="text"
                placeholder="NFT Name"
                value={newNFT.name}
                onChange={(e) => setNewNFT({ ...newNFT, name: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="NFT Description"
                value={newNFT.description}
                onChange={(e) => setNewNFT({ ...newNFT, description: e.target.value })}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price in ETH"
                value={newNFT.price}
                onChange={(e) => setNewNFT({ ...newNFT, price: e.target.value })}
                required
              />
              <FileInput
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*"
                required
              />
              <ToggleButton
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create NFT'}
              </ToggleButton>
            </form>
          </Card>
        )}
      </MainContent>
    </Container>
  );
}