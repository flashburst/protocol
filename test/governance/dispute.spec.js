const BigNumber = require('bignumber.js')
const { deployer, key } = require('../../util')
const { deployDependencies } = require('./deps')
const attacher = require('../util/attach')
const blockHelper = require('../util/block')

const cache = null

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

describe('Governance: `dispute` function', () => {
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

  it('must correctly dispute', async () => {
    const amount = '1'

    await store.initialize(coverKey)

    const tx = await governance.report(coverKey, key.toBytes32('foobar'), amount)
    const incidentDate = await blockHelper.getBlockTimestamp(tx.blockNumber)
    await tx.wait()

    await governance.dispute(coverKey, incidentDate.unix(), key.toBytes32('foobar'), amount)
  })

  it('must reject when the protocol is paused', async () => {
    const amount = '1'

    const protocolAddress = await store.callStatic.initialize(coverKey)
    await store.initialize(coverKey)
    const blockTimestamp = await blockHelper.getTimestamp()

    const protocol = await attacher.protocol.attach(protocolAddress, libraries.all)
    await protocol.setPaused(true)

    await governance.dispute(coverKey, blockTimestamp.unix(), key.toBytes32('foobar'), amount).should.be.rejectedWith('Protocol is paused')
  })

  it('must reject when invalid cover key is supplied', async () => {
    const amount = '1'

    await store.initialize(coverKey)
    const blockTimestamp = await blockHelper.getTimestamp()

    await governance.dispute(key.toBytes32('foobar'), blockTimestamp.unix(), key.toBytes32('foobar'), amount).should.be.rejectedWith('Not reporting')
  })
})
