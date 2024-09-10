import React from 'react';
import { motion } from 'framer-motion';
import { FaEthereum } from 'react-icons/fa';
import { truncateString } from '../../utils/stringUtils';
import './NFTCard.css';

const NFTCard = ({ nft, onPurchase }) => {
  return (
    <motion.div className="nft-card">
      <div className="image-container">
        <motion.img
          src={nft.image}
          alt={nft.name}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        <span className="token-id">#{truncateString(nft.tokenId, 6)}</span>
      </div>
      <h3 className="nft-name">{truncateString(nft.name, 20)}</h3>
      <div className="price-container">
        <FaEthereum size={20} color="#4d79ff" />
        <p className="price">
          {typeof nft.price === 'string'
            ? nft.price
            : `${parseFloat(nft.price).toFixed(3)} ETH`}
        </p>
      </div>
      <motion.div
        className="hover-details"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="collection-name">{nft.collectionName}</p>
        <p className="description">{truncateString(nft.description, 100)}</p>
        <p className="detail-item"><strong>Token ID:</strong> {nft.tokenId}</p>
        <p className="detail-item"><strong>Floor Price:</strong> {nft.floorPrice || 'N/A'} ETH</p>
        <p className="detail-item"><strong>Total Volume:</strong> {nft.totalVolume || 'N/A'} ETH</p>
        <p className="detail-item"><strong>Owner:</strong> {truncateString(nft.owner || 'Unknown', 15)}</p>
        <motion.button
          className="purchase-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPurchase(nft)}
        >
          Purchase
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default NFTCard;