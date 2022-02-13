const BigNumber = require('bignumber.js')
const { deployer, key } = require('../../util')
const { deployDependencies } = require('./deps')

const cache = null

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

describe('Governance: Constructor & Initializer', () => {
  let libraries, store, governance

  beforeEach(async () => {
    libraries = await deployDependencies()
    const storeLib = await deployer.deployWithLibraries(cache, 'MockGovernanceStoreLib', { StoreKeyUtil: libraries.dependencies.StoreKeyUtil })

    store = await deployer.deployWithLibraries(cache, 'MockGovernanceStore', { MockGovernanceStoreLib: storeLib.address })
    governance = await deployer.deployWithLibraries(cache, 'Governance', libraries.dependencies, store.address)
  })

  it('must successfully constructs the governance contract', async () => {
    (await governance.s()).should.equal(store.address)
  })

  it('must ensure correct version number', async () => {
    (await governance.version()).should.equal(key.toBytes32('v0.1'))
  })

  it('must ensure correct contract namespace', async () => {
    (await governance.getName()).should.equal(key.PROTOCOL.CNAME.GOVERNANCE)
  })
})
