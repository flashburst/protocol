// Neptune Mutual Protocol (https://neptunemutual.com)
// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.0;
import "../base/MockStore.sol";
import "../base/MockProtocol.sol";
import "../../libraries/ProtoUtilV1.sol";
import "../../libraries/StoreKeyUtil.sol";

library MockGovernanceStoreLib {
  using StoreKeyUtil for MockStore;

  function initialize(
    MockStore s,
    bytes32 key,
    address npmToken,
    address router,
    address factory
  ) external returns (address[] memory values) {
    MockProtocol protocol = new MockProtocol();

    s.setAddress(ProtoUtilV1.CNS_CORE, address(protocol));
    s.setBoolByKeys(ProtoUtilV1.NS_COVER, key, true);
    s.setUintByKeys(ProtoUtilV1.NS_GOVERNANCE_REPORTING_PERIOD, key, 5);

    s.setAddressByKey(ProtoUtilV1.CNS_NPM, npmToken);
    s.setAddress(ProtoUtilV1.CNS_COVER_STABLECOIN, npmToken);

    s.setAddressByKey(ProtoUtilV1.CNS_UNISWAP_V2_ROUTER, router);
    s.setAddressByKey(ProtoUtilV1.CNS_UNISWAP_V2_FACTORY, factory);

    setCoverStatus(s, key, 0);

    values = new address[](1);

    values[0] = address(protocol);
  }

  function setCoverStatus(
    MockStore s,
    bytes32 key,
    uint256 value
  ) public {
    s.setUint(ProtoUtilV1.NS_COVER_STATUS, key, value);
  }

  function setResolutionContract(MockStore s, address addr) public {
    s.setAddressByKeys(ProtoUtilV1.NS_CONTRACTS, ProtoUtilV1.CNS_GOVERNANCE_RESOLUTION, addr);
  }
}

contract MockGovernanceStore is MockStore {
  function initialize(
    bytes32 key,
    address npmToken,
    address router,
    address factory
  ) external returns (address) {
    address[] memory values = MockGovernanceStoreLib.initialize(this, key, npmToken, router, factory);

    return values[0];
  }

  function setCoverStatus(bytes32 key, uint256 value) external {
    MockGovernanceStoreLib.setCoverStatus(this, key, value);
  }

  function setResolutionContract(address addr) external {
    MockGovernanceStoreLib.setResolutionContract(this, addr);
  }
}
