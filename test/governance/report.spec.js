const BigNumber = require('bignumber.js')
const { deployer, key } = require('../../util')
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
    const transferLib = await deployer.deploy(cache, 'MockTransferLib')
    const storeLib = await deployer.deployWithLibraries(cache, 'MockGovernanceStoreLib', {
      StoreKeyUtil: libraries.dependencies.StoreKeyUtil
    })

    store = await deployer.deployWithLibraries(cache, 'MockGovernanceStore', {
      MockGovernanceStoreLib: storeLib.address
    })

    governance = await deployer.deployWithLibraries(
      cache,
      'Governance',
      {
        ...libraries.dependencies,
        NTransferUtilV2: transferLib.address
      },
      store.address
    )
  })

  it('must correctly report', async () => {
    const amount = '1'

    await store.initialize(coverKey)

    await governance.report(coverKey, key.toBytes32('foobar'), amount)
  })

  it('must reject when the protocol is paused', async () => {
    const amount = '1'

    const protocolAddress = await store.callStatic.initialize(coverKey)
    await store.initialize(coverKey)

    const protocol = await attacher.protocol.attach(protocolAddress, libraries.all)
    await protocol.setPaused(true)

    await governance.report(coverKey, key.toBytes32('foobar'), amount).should.be.rejectedWith('Protocol is paused')
  })

  it('must reject when invalid cover key is supplied', async () => {
    const amount = '1'

    await store.initialize(coverKey)

    await governance.report(key.toBytes32('foobar'), key.toBytes32('foobar'), amount).should.be.rejectedWith('Cover does not exist')
  })
})
