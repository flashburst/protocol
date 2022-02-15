const BigNumber = require('bignumber.js')
const { deployer, key, helper } = require('../../util')
const { deployDependencies } = require('./deps')
const attacher = require('../util/attach')

const cache = null

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

describe('Governance: `report` function', () => {
  let libraries, store, governance

  const coverKey = key.toBytes32('test')

  beforeEach(async () => {
    libraries = await deployDependencies()
    const storeLib = await deployer.deployWithLibraries(
      cache,
      'MockGovernanceStoreLib',
      {
        StoreKeyUtil: libraries.dependencies.StoreKeyUtil
      }
    )

    store = await deployer.deployWithLibraries(cache, 'MockGovernanceStore', {
      MockGovernanceStoreLib: storeLib.address
    })

    governance = await deployer.deployWithLibraries(
      cache,
      'Governance',
      libraries.dependencies,
      store.address
    )
  })

  it('must correctly report', async () => {
    const amount = '1'

    const npm = await deployer.deploy(
      cache,
      'FakeToken',
      'Neptune Mutual Token',
      'NPM',
      helper.ether(10000)
    )
    const router = await deployer.deploy(cache, 'FakeUniswapV2RouterLike')
    const pair = await deployer.deploy(
      cache,
      'FakeUniswapV2PairLike',
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002'
    )
    const factory = await deployer.deploy(
      cache,
      'FakeUniswapV2FactoryLike',
      pair.address
    )

    await store.initialize(
      coverKey,
      npm.address,
      router.address,
      factory.address
    )

    const resolution = await deployer.deployWithLibraries(
      cache,
      'Resolution',
      {
        AccessControlLibV1: libraries.all.accessControlLibV1.address,
        BaseLibV1: libraries.all.baseLibV1.address,
        RoutineInvokerLibV1: libraries.all.RoutineInvokerLibV1.address,
        StoreKeyUtil: libraries.all.storeKeyUtil.address,
        ProtoUtilV1: libraries.all.protoUtilV1.address,
        CoverUtilV1: libraries.all.coverUtilV1.address,
        NTransferUtilV2: libraries.all.transferLib.address,
        ValidationLibV1: libraries.all.validationLib.address,
        GovernanceUtilV1: libraries.all.governanceLib.address
      },
      store.address
    )

    await store.setResolutionContract(resolution.address)

    await npm.approve(governance.address, amount)
    await governance.report(coverKey, key.toBytes32('foobar'), amount)
  })

  // it('must reject when the protocol is paused', async () => {
  //   const amount = '1'

  //   const protocolAddress = await store.callStatic.initialize(coverKey)
  //   await store.initialize(coverKey)

  //   const protocol = await attacher.protocol.attach(protocolAddress, libraries.all, 'MockGovernanceProtocol')
  //   await protocol.setPaused(true)

  //   const npm = await deployer.deploy(cache, 'FakeToken', 'Neptune Mutual Token', 'NPM', helper.ether(10000))
  //   await protocol.setNPMAddress(npm.address)

  //   await governance.report(coverKey, key.toBytes32('foobar'), amount).should.be.rejectedWith('Protocol is paused')
  // })

  // it('must reject when invalid cover key is supplied', async () => {
  //   const amount = '1'

  //   await store.initialize(coverKey)

  //   await governance.report(key.toBytes32('foobar'), key.toBytes32('foobar'), amount).should.be.rejectedWith('Cover does not exist')
  // })
})
