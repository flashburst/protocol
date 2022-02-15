const { ethers } = require('hardhat')

const attach = async (contractName, address, libraries) => {
  console.log(contractName, address, libraries)
  const contract = libraries ? await ethers.getContractFactory(contractName, libraries) : await ethers.getContractFactory(contractName)
  return contract.attach(address)
}

module.exports = { attach }
