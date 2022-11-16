const { network } = require('hardhat')
const { ethers } = require('hardhat')
const config = require('../../scripts/config/network')

const main = async () => {
  const [deployer] = await ethers.getSigners()
  const chainId = network.config.chainId

  console.log('Deployer: %s. Balance: %s', deployer.address, await deployer.getBalance())

  const ContractFactory = await ethers.getContractFactory('NpmPriceOracle')

  const oracle = await ContractFactory.deploy(config[chainId].stablecoinPairs.NPM_STABLECOIN, config[chainId].deployedTokens.NPM)
  await oracle.deployed()

  console.log('Deployed: %s/address/%s', network.config.explorer, oracle.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
