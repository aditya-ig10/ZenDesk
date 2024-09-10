'use client'

import React, { useEffect, useState, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes, Global, css } from '@emotion/react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import logo from './logo.png';

const GradientBackground = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0a0015, #1a0025, #0a0015);
  background-size: 400% 400%;
  z-index: -1;
`;

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const GradientBall = styled(motion.div)`
  position: fixed;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(30px);
  opacity: 0.6;
  animation: ${gradientAnimation} 15s ease infinite;
`;

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  color: white;
  font-family: 'Playfair Display', serif;
`;

const Header = styled(motion.header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 3rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  background-color: rgba(10, 0, 21, 0.5);
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(motion.a)`
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: color 0.3s ease;
  position: relative;
  &:hover {
    color: #ffffff;
  }
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: -5px;
    left: 0;
    background-color: #ff4d6d;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  &:hover::after {
    transform: scaleX(1);
  }
`;

const MainContent = styled(motion.main)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding-top: 80px;
`;

const TextContent = styled.div`
  max-width: 50%;
`;

const Title = styled(motion.h1)`
  font-size: 4.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  font-family: 'Playfair Display', serif;
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-weight: 300;
  line-height: 1.6;
  font-family: 'Lora', serif;
`;

const Button = styled(motion.button)`
  background-color: #ff4d6d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;

  &:hover {
    background-color: #ff3057;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 77, 109, 0.4);
  }
`;

const loadingLineAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0a0015;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingLine = styled.div`
  width: 200px;
  height: 4px;
  background-color: #ff4d6d;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #ffffff, transparent);
    animation: ${loadingLineAnimation} 1.5s infinite;
  }
`;

const MetamaskPopup = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(26, 0, 37, 0.9);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  backdrop-filter: blur(10px);
  max-width: 90%;
  width: 400px;
`;

const PopupText = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: white;
  text-align: center;
`;

const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem;
  color: white;

  h2 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-family: 'Playfair Display', serif;
  }

  p {
    font-size: 1.2rem;
    max-width: 600px;
    font-family: 'Lora', serif;
    margin-bottom: 1rem;
  }

  ul {
    font-family: 'Lora', serif;
    font-size: 1.1rem;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const CourseCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
  }
`;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMetamaskPopup, setShowMetamaskPopup] = useState(false);
  const router = useRouter();

  const exploreRef = useRef(null);
  const newsRef = useRef(null);
  const developersRef = useRef(null);
  const designersRef = useRef(null);
  const buyingSellingRef = useRef(null);
  const coursesRef = useRef(null);

  const { scrollYProgress } = useScroll();

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  const ball1Y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const ball2Y = useTransform(scrollYProgress, [0, 1], ['50%', '0%']);
  const ball3Y = useTransform(scrollYProgress, [0, 1], ['100%', '50%']);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 3000);
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to check existing connection:", error);
      }
    }
  };

  const handleLogin = async () => {
    setIsConnecting(true);

    if (typeof window.ethereum === 'undefined') {
      setShowMetamaskPopup(true);
      setIsConnecting(false);
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        setIsLoggedIn(true);
        localStorage.setItem('connectedAddress', accounts[0]);
        router.push('/home');
      } else {
        console.error('No accounts found');
      }
    } catch (error) {
      console.error('Error during login:', error);
      if (error.code === 4001) {
        // User rejected the connection request
        console.log("User rejected the connection request");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Global
        styles={css`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lora:wght@400;700&family=Montserrat:wght@400;700&display=swap');
          body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            background-color: #0a0015;
            overflow-x: hidden;
          }
        `}
      />
      <GradientBackground style={{ y: backgroundY, opacity: backgroundOpacity }} />
      <GradientBall 
        style={{ 
          top: ball1Y,
          left: '60%',
          background: 'radial-gradient(circle at 30% 30%, #ff4d6d, #ff4d6d00)',
        }} 
      />
      <GradientBall 
        style={{ 
          top: ball2Y, 
          left: '20%',
          background: 'radial-gradient(circle at 30% 30%, #4d79ff, #4d79ff00)',
        }} 
      />
      <GradientBall 
        style={{ 
          top: ball3Y, 
          left: '80%',
          background: 'radial-gradient(circle at 30% 30%, #4dffb8, #4dffb800)',
        }} 
      />
      <AnimatePresence>
        {isLoading && (
          <LoadingOverlay
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingLine />
          </LoadingOverlay>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showMetamaskPopup && (
          <MetamaskPopup
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <PopupText>Please install MetaMask to proceed.</PopupText>
            <Button onClick={() => setShowMetamaskPopup(false)}>Close</Button>
          </MetamaskPopup>
        )}
      </AnimatePresence>
      <Header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 3 }}
      >
        <Logo>
          <Image src={logo} alt="Zendesk" width={180} height={55} />
        </Logo>
        <Nav>
          <NavLink onClick={() => scrollToSection(exploreRef)}>Explore</NavLink>
          <NavLink onClick={() => scrollToSection(newsRef)}>News</NavLink>
          <NavLink onClick={() => scrollToSection(developersRef)}>Developers</NavLink>
          <NavLink onClick={() => scrollToSection(designersRef)}>Designers</NavLink>
          <NavLink onClick={() => scrollToSection(buyingSellingRef)}>Buy/Sell</NavLink>
          <NavLink onClick={() => scrollToSection(coursesRef)}>Courses</NavLink>
        </Nav>
      </Header>
      <Container>
        <MainContent
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <TextContent>
            <Title variants={itemVariants}>
              ZenDesk.io
            </Title>
            <Subtitle variants={itemVariants}>
              Revolutionizing NFT minting with zero gas fees. Our innovative platform leverages AdSense API to cover gas costs, making NFT creation accessible to all.
            </Subtitle>
            <Button
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleLogin}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : isLoggedIn ? "Connected" : "Connect with MetaMask"}
      </Button>
          </TextContent>
        </MainContent>
        <Section ref={exploreRef}>
          <h2>Explore ZenDesk.io</h2>
          <p>Discover a world of gas-free NFT minting and unique digital assets:</p>
          <ul>
            <li>Browse our extensive gallery of user-created NFTs</li>
            <li>Learn about our innovative gas-free minting process</li>
            <li>Experiment with our gradient creation tools</li>
            <li>Join challenges and competitions for NFT creators</li>
          </ul>
          <p>Start your journey into the world of accessible NFT creation today!</p>
        </Section>
        <Section ref={newsRef}>
          <h2>Latest News</h2>
          <p>Stay updated with the latest developments in the ZenDesk.io ecosystem:</p>
          <ul>
            <li>ZenDesk.io partners with major advertising networks to expand gas-free minting</li>
            <li>New features added: Collaborative NFT creation and fractionalized ownership</li>
            <li>ZenDesk.io community reaches 100,000 active users</li>
            <li>Upcoming AMA session with our founder on the future of gas-free NFTs</li>
          </ul>
          <p>Follow our blog and social media channels for real-time updates!</p>
        </Section>
        <Section ref={developersRef}>
          <h2>For Developers</h2>
          <p>Build on top of ZenDesk.io's innovative gas-free infrastructure:</p>
          <ul>
            <li>Access our comprehensive API documentation</li>
            <li>Integrate gas-free minting into your dApps</li>
            <li>Contribute to our open-source projects on GitHub</li>
            <li>Participate in hackathons and bounty programs</li>
          </ul>
          <p>Join our developer community and shape the future of NFT technology!</p>
        </Section>
        <Section ref={designersRef}>
          <h2>For Designers</h2>
          <p>Unleash your creativity with our suite of design tools:</p>
          <ul>
            <li>Use our intuitive gradient generator to create stunning backgrounds</li>
            <li>Access a library of design elements optimized for NFTs</li>
            <li>Collaborate with other designers on community projects</li>
            <li>Showcase your work in our featured artists gallery</li>
          </ul>
          <p>Turn your artistic vision into reality with ZenDesk.io!</p>
        </Section>
        <Section ref={buyingSellingRef}>
          <h2>Buying and Selling NFTs</h2>
          <p>Learn how to navigate the world of NFT trading on ZenDesk.io:</p>
          <ul>
            <li>Create an account and set up your digital wallet</li>
            <li>Browse our marketplace and discover unique NFTs</li>
            <li>Place bids or buy NFTs instantly</li>
            <li>List your own NFTs for sale with our gas-free minting process</li>
            <li>Understand royalties and how creators earn from secondary sales</li>
            <li>Learn about best practices for NFT valuation and investment</li>
          </ul>
          <p>Start your NFT trading journey with confidence on ZenDesk.io!</p>
        </Section>
        <Section ref={coursesRef}>
          <h2>Courses</h2>
          <p>Enhance your skills with our upcoming educational programs:</p>
          <CourseCard>
            <h3>NFT Creation Masterclass</h3>
            <p>Learn the art and technology behind creating successful NFTs. Coming soon!</p>
          </CourseCard>
          <CourseCard>
            <h3>Web3 Development Fundamentals</h3>
            <p>Dive into blockchain technology and smart contract development. Coming soon!</p>
          </CourseCard>
          <CourseCard>
            <h3>Digital Art for NFTs</h3>
            <p>Master the techniques for creating eye-catching digital art for the NFT market. Coming soon!</p>
          </CourseCard>
          <CourseCard>
            <h3>NFT Marketing and Promotion</h3>
            <p>Learn strategies to effectively market and promote your NFT projects. Coming soon!</p>
          </CourseCard>
          <p>Stay tuned for course launch dates and early bird discounts!</p>
        </Section>
      </Container>
    </>
  );
}