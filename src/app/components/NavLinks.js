'use client'

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

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

const NavLinks = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (page) => {
    router.push(`/${page}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('connectedAddress');
    router.push('/');
  };

  return (
    <Nav>
      <NavLink 
        onClick={() => handleNavigation('home')} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        isActive={pathname === '/home'}
      >
        Home
      </NavLink>
      <NavLink 
        onClick={() => handleNavigation('wallet')} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        isActive={pathname === '/wallet'}
      >
        Crypto
      </NavLink>
      <NavLink 
        onClick={() => handleNavigation('marketplace')} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        isActive={pathname === '/marketplace'}
      >
        Marketplace
      </NavLink>
      {/* <NavLink 
        onClick={() => handleNavigation('sepolia')} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        isActive={pathname === '/sepolia'}
      >
        Sepolia Testnet
      </NavLink> */}
      <NavLink 
        onClick={() => handleNavigation('tokens')} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
        isActive={pathname === '/tokens'}
      >
        Tokens
      </NavLink>
      <NavLink 
        onClick={() => router.push('/profile')} 
        isActive={pathname === '/profile'}
      >
        Profile
      </NavLink>
      <NavLink 
        onClick={handleLogout} 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
      >
        Logout
      </NavLink>
    </Nav>
  );
};

export default NavLinks;