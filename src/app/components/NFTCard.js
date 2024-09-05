import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const Name = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const Price = styled.p`
  font-size: 1rem;
  color: #4d79ff;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: linear-gradient(45deg, #ff4d6d, #4d79ff);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;


const NFTCard = ({ nft, onPurchase }) => {
  return (
    <Card
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Image src={nft.image} alt={nft.name} />
      <Name>{nft.name}</Name>
      <Price>{typeof nft.price === 'string' ? nft.price : `${nft.price} ETH`}</Price>
      <Button onClick={onPurchase}>Purchase</Button>
    </Card>
  );
};

export default NFTCard;