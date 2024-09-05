'use client'

import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '../logo.png';
import { ethers } from 'ethers';
import NavLinks from '../components/NavLinks';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`;

const NavLink = styled(motion.a)`
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: ${props => props.isActive ? '100%' : '0'};
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: #ff4d6d;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
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

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
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


const Dashboard = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const DashboardCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const NFTCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function HomePage() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [purchasedNFTs, setPurchasedNFTs] = useState([]);
  const [nftGrowthData, setNftGrowthData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const connectedAddress = localStorage.getItem('connectedAddress');
    if (connectedAddress) {
      setAddress(connectedAddress);
      fetchBalance(connectedAddress);
      fetchPurchasedNFTs();
      generateNFTGrowthData();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchBalance = async (address) => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const fetchPurchasedNFTs = () => {
    const nfts = JSON.parse(localStorage.getItem('purchasedNFTs') || '[]');
    setPurchasedNFTs(nfts);
  };

  const generateNFTGrowthData = () => {
    const nfts = JSON.parse(localStorage.getItem('purchasedNFTs') || '[]');
    const growthData = nfts.reduce((acc, nft, index) => {
      acc.push({ name: `Day ${index + 1}`, NFTs: index + 1 });
      return acc;
    }, []);
    setNftGrowthData(growthData);
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
        <Title variants={itemVariants}>Welcome to ZenDesk.io</Title>
        <Subtitle variants={itemVariants}>
          Connected Address: {address}
          <br />
          Available Balance: {balance} ETH
        </Subtitle>
        <Dashboard>
          <DashboardCard variants={itemVariants}>
            <h2>NFTs Owned</h2>
            <p>{purchasedNFTs.length}</p>
          </DashboardCard>
          <DashboardCard variants={itemVariants}>
            <h2>NFT Growth</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={nftGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="NFTs" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </DashboardCard>
        </Dashboard>
        <Card variants={itemVariants}>
          <h2>Your NFTs</h2>
          <NFTGrid>
            {purchasedNFTs.map((nft, index) => (
              <NFTCard key={index} variants={itemVariants}>
                <h3>Token ID: {nft.tokenId}</h3>
                <p>Price: {nft.price} ETH</p>
              </NFTCard>
            ))}
          </NFTGrid>
        </Card>
      </MainContent>
    </Container>
  );
}