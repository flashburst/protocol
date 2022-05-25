const { ethers } = require('hardhat')

const ReservesOracle = '0xF28f0FAB082777Ba859136dfE9D43B2453DA5f0b'
const DAI = '0x76061C192fBBBF210d2dA25D4B8aaA34b798ccaB'
const NPM = '0x001Ffb65fF6E15902072C5133C016fD89cB56a7e'

async function main () {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)

  console.log('Account balance:', (await deployer.getBalance()).toString())

  const ContractFactory = await ethers.getContractFactory('NPMReservesOracle')
  const instance = ContractFactory.attach(ReservesOracle)

  console.log(await instance.reserve0())
  console.log(await instance.reserve1())
  console.log(await instance.blockTimestampLast())

  // Update amounts
  // const tx = await instance.update()
  // await tx.wait()

  // DAI per NPM
  const reserve0 = await instance.consult(NPM, '1000000000000000000')
  // NPM per DAI
  const reserve1 = await instance.consult(DAI, '1000000000000000000')

  console.log({
    reserve0,
    reserve1
  })
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
