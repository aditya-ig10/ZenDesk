import { ethers } from 'ethers';
import { InjectedConnector } from '@web3-react/injected-connector';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42] // Add the chain IDs you support
});

export const getContract = (address, abi, signer) => {
  return new ethers.Contract(address, abi, signer);
};