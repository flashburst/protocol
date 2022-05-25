require('hardhat-contract-sizer')
require('@nomiclabs/hardhat-waffle')
require('solidity-coverage')
require('hardhat-gas-reporter')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
  defaultNetwork: 'local',
  networks: {
    local: {
      url: 'http://localhost:24012/rpc'
    }
  },
  solidity: {
    version: '0.6.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 999_999
      }
    }
  }
}

module.exports = config
