const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ZendeskNFT = await hre.ethers.getContractFactory("ZendeskNFT");
  
  // Pass the deployer's address as the initial owner
  const zendeskNFT = await ZendeskNFT.deploy(deployer.address);

  await zendeskNFT.deployed();

  console.log("ZendeskNFT deployed to:", zendeskNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });