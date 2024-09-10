'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../logo.png';
import { ethers } from 'ethers';
import NavLinks from '../components/NavLinks';
import NFTCard from '../components/NFTCard';
import ZendeskNFTABI from '../../../contracts/ZendeskNFT.json';
import './MarketplacePage.css'; // Make sure to create this CSS file

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

const loaderVariants = {
  animate: {
    rotate: 360,
    transition: {
      loop: Infinity,
      ease: "linear",
      duration: 1
    }
  }
};

export default function MarketplacePage() {
  const router = useRouter();
  const [nfts, setNFTs] = useState([]);
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);

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

  useEffect(() => {
    const filtered = nfts.filter(nft => 
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNFTs(filtered);
  }, [searchTerm, nfts]);

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
      setFilteredNFTs(data.nfts);
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

      // Convert price to wei
      const priceInWei = ethers.utils.parseEther(price);

      // Create transaction request
      const tx = await contract.purchaseNFT(tokenId, { value: priceInWei });

      // Open Metamask for confirmation
      await signer.sendTransaction(tx);

      alert('NFT purchase transaction sent. Please check your wallet for confirmation.');
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

  const openPurchasePopup = (nft) => {
    setSelectedNFT(nft);
    setShowPopup(true);
  };

  const closePurchasePopup = () => {
    setShowPopup(false);
    setSelectedNFT(null);
  };

  const confirmPurchase = () => {
    if (selectedNFT) {
      handlePurchase(selectedNFT.tokenId, selectedNFT.price);
    }
    closePurchasePopup();
  };

  return (
    <motion.div className="container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.div className="logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/home')}
        >
          <Image src={logo} alt="Zendesk" width={180} height={55} />
        </motion.div>
        <nav className="nav">
          <NavLinks />
        </nav>
      </motion.header>
      <main className="main-content">
        <motion.h1 className="title" variants={itemVariants}>NFT Marketplace</motion.h1>
        <input 
          className="search-bar"
          placeholder="Search NFTs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isLoading ? (
          <motion.div className="loader" variants={loaderVariants} animate="animate" />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="nft-grid">
            {filteredNFTs.map((nft) => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                onPurchase={() => openPurchasePopup(nft)}
              />
            ))}
          </div>
        )}
      </main>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Purchase NFT</h2>
            <p>Select token to purchase with:</p>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
            </select>
            <p>Price: {selectedNFT.price} {selectedToken}</p>
            <div className="popup-buttons">
              <button onClick={confirmPurchase}>Confirm Purchase</button>
              <button onClick={closePurchasePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}