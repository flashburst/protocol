const hre = require('hardhat')
const moment = require('moment')

const getTimestamp = async () => {
  const { timestamp } = await hre.ethers.provider.getBlock('latest')
  return moment.unix(timestamp)
}

/**
 * Gets timestamp of a block by blockNumber
 * @param {number} block
 */
const getBlockTimestamp = async (block) => {
  const { timestamp } = await hre.ethers.provider.getBlock(block)
  return moment.unix(timestamp)
}

module.exports = { getTimestamp, getBlockTimestamp }
