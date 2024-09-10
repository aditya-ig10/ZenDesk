'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '../logo.png';
import NavLinks from '../components/NavLinks';
import dynamic from 'next/dynamic';
import { FiPlay } from 'react-icons/fi';
import Script from 'next/script';
import axios from 'axios';


// Dynamically import chart components to avoid SSR issues
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

// Dynamically import Chart.js to avoid SSR issues
import('chart.js').then((ChartModule) => {
  ChartModule.Chart.register(
    ChartModule.ArcElement,
    ChartModule.Tooltip,
    ChartModule.Legend,
    ChartModule.CategoryScale,
    ChartModule.LinearScale,
    ChartModule.BarElement,
    ChartModule.PointElement,
    ChartModule.LineElement
  );
});

const Container = styled(motion.div)`
  min-height: 100vh;
  color: white;
  font-family: 'Poppins', sans-serif;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(5px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(45deg, #ff4d6d, #4d79ff);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 1rem;
`;

const TokenDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin: 1rem 0;
  color: #4d79ff;
`;

const AdOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const AdContainer = styled.div`
  background-color: #1a0030;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  min-width: 300px;
  min-height: 250px;
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

export default function TokensDashboard() {
  const router = useRouter();
  const [userTokens, setUserTokens] = useState(1);
  const [adPerformance, setAdPerformance] = useState({ impressions: 1000, clicks: 50, earnings: 500 });
  const [tokenHistory, setTokenHistory] = useState([65, 59, 80, 81, 56, 55]);
  const [isAdWatched, setIsAdWatched] = useState(false);
  const [adTimer, setAdTimer] = useState(10);
  const adRef = useRef(null);
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    const storedAddress = localStorage.getItem('connectedAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    } else {
      router.push('/'); // Redirect to home if no wallet address is found
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchUserTokens(walletAddress);
    }
  }, [walletAddress]);

  const fetchUserTokens = async (address) => {
    try {
      const response = await fetch(`/api/tokens?address=${address}`);
      if (response.ok) {
        const tokenData = await response.json();
        setUserTokens(tokenData.tokens || 0);
        setAdPerformance(tokenData.adPerformance || { impressions: 1000, clicks: 50, earnings: 500 });
        setTokenHistory(tokenData.tokenHistory || [65, 59, 80, 81, 56, 55]);
      } else {
        throw new Error('Failed to fetch user tokens');
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error);
    }
  };

const saveUserTokens = async () => {
  try {
    const tokenData = {
      tokens: userTokens,
      adPerformance,
      tokenHistory,
    };

    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: walletAddress, tokenData }),
    });

    if (!response.ok) {
      throw new Error('Failed to save tokens');
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
};

  const pinJSONToIPFS = async (JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

    const response = await axios.post(url, JSONBody, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      }
    });

    return response.data.IpfsHash;
  };

  const handleWatchAd = useCallback(() => {
    setIsAdWatched(true);
    setAdTimer(10);
  }, []);

  useEffect(() => {
    let interval;
    if (isAdWatched && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (adTimer === 0) {
      setUserTokens((prev) => prev + 1);
      setAdPerformance((prev) => ({
        ...prev,
        impressions: prev.impressions + 1,
        clicks: prev.clicks + 1,
        earnings: +(prev.earnings + 0.5).toFixed(2),
      }));
      setTokenHistory((prev) => [...prev.slice(1), prev[prev.length - 1] + 1]);
      setIsAdWatched(false);
      saveUserTokens(); // Save updated token data
    }
    return () => clearInterval(interval);
  }, [isAdWatched, adTimer]);

  useEffect(() => {
    if (isAdWatched && adRef.current) {
      try {
        // Attempt to load the ad after a short delay
        const adLoadTimer = setTimeout(() => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }, 100);

        return () => clearTimeout(adLoadTimer);
      } catch (error) {
        console.error("Error loading ad:", error);
      }
    }
  }, [isAdWatched]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'white' }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'white' }
      }
    },
    plugins: {
      legend: { labels: { color: 'white' } }
    }
  };

  const barData = {
    labels: ['Impressions', 'Clicks', 'Earnings'],
    datasets: [{
      label: 'Ad Performance',
      data: [adPerformance.impressions, adPerformance.clicks, adPerformance.earnings],
      backgroundColor: ['rgba(255, 77, 109, 0.6)', 'rgba(77, 121, 255, 0.6)', 'rgba(255, 206, 86, 0.6)']
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Token Balance Over Time',
      data: tokenHistory,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <Container
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Script
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3224167902119761`}
        crossOrigin="anonymous"
      />
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
        <Title variants={itemVariants}>Token Dashboard</Title>
        <Grid>
          <Card variants={itemVariants}>
            <h2>Your Tokens</h2>
            <TokenDisplay>{userTokens}</TokenDisplay>
            <Button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleWatchAd}>
              <FiPlay /> Watch Ad for Token
            </Button>
          </Card>
          <Card variants={itemVariants}>
            <h2>Ad Performance</h2>
            <ChartContainer>
              <Bar data={barData} options={chartOptions} />
            </ChartContainer>
          </Card>
          <Card variants={itemVariants}>
            <h2>Token History</h2>
            <ChartContainer>
              <Line data={lineData} options={chartOptions} />
            </ChartContainer>
          </Card>
        </Grid>
      </MainContent>
      <AnimatePresence>
        {isAdWatched && (
          <AdOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdContainer>
              <h2>Watching Ad...</h2>
              <p>You'll receive your token after the ad finishes in {adTimer} seconds.</p>
              <div ref={adRef}>
                <ins className="adsbygoogle"
                     style={{ display: 'block', width: '300px', height: '250px' }}
                     data-ad-client="ca-pub-3224167902119761"
                     data-ad-slot="3104732648"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
              </div>
            </AdContainer>
          </AdOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}