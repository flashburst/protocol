const { ethers } = require('hardhat')

const ReservesOracle = '0x9fCe0D22028F4d1040ED9CE43995031d89BB665F'
const DAI = '0x76061C192fBBBF210d2dA25D4B8aaA34b798ccaB'
const NPM = '0x001Ffb65fF6E15902072C5133C016fD89cB56a7e'

async function main () {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)

  console.log('Account balance:', (await deployer.getBalance()).toString())

  const ContractFactory = await ethers.getContractFactory('NPMReservesOracle')
  const instance = ContractFactory.attach(ReservesOracle)

  console.log(await instance.reserve0CumulativeLast())
  console.log(await instance.reserve1CumulativeLast())

  console.log(await instance.blockTimestampLast())
  console.log(await instance.reserve0Average())
  console.log(await instance.reserve1Average())

  console.log(await instance.blockTimestampLastInternal())
  console.log(await instance.reserve0())
  console.log(await instance.reserve1())

  // Update amounts
  const tx = await instance.update()
  await tx.wait()

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
