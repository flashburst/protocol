const composer = require('../../util/composer')
const cache = null

/**
 * Deploys all libraries
 * @return {Promise<{dependencies: Object, all: Libraries}>}
 */
const deployDependencies = async () => {
  const all = await composer.libs.deployAll(cache)

  return {
    dependencies: {
      AccessControlLibV1: all.accessControlLibV1.address,
      BaseLibV1: all.baseLibV1.address,
      GovernanceUtilV1: all.governanceLib.address,
      CoverUtilV1: all.coverUtilV1.address,
      NTransferUtilV2: all.transferLib.address,
      ProtoUtilV1: all.protoUtilV1.address,
      RegistryLibV1: all.registryLibV1.address,
      StoreKeyUtil: all.storeKeyUtil.address,
      ValidationLibV1: all.validationLib.address
    },
    all
  }
}

module.exports = { deployDependencies }
