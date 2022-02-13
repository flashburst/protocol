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
    bytes32 key
    // address cxToken
  ) external returns (address[] memory values) {
    MockProtocol protocol = new MockProtocol();
    

    s.setAddress(ProtoUtilV1.CNS_CORE, address(protocol));
    s.setBoolByKeys(ProtoUtilV1.NS_COVER, key, true);
    s.setUintByKeys(ProtoUtilV1.NS_GOVERNANCE_REPORTING_PERIOD, key, 5);
    // s.setAddress(ProtoUtilV1.CNS_COVER_STABLECOIN, cxToken);

    // s.setBool(ProtoUtilV1.NS_COVER_CXTOKEN, cxToken);
    // s.setBool(ProtoUtilV1.NS_MEMBERS, cxToken);
    // s.setUint(ProtoUtilV1.NS_GOVERNANCE_REPORTING_INCIDENT_DATE, key, 1234);

     
    setCoverStatus(s, key, 0);
    // setClaimBeginTimestamp(s, key, block.timestamp - 100 days); // solhint-disable-line
    // setClaimExpiryTimestamp(s, key, block.timestamp + 100 days); // solhint-disable-line

    values = new address[](1);

    values[0] = address(protocol);
    
  }

  // function disassociateCxToken(MockStore s, address cxToken) external {
  //   s.unsetBool(ProtoUtilV1.NS_COVER_CXTOKEN, cxToken);
  // }

  function setCoverStatus(
    MockStore s,
    bytes32 key,
    uint256 value
  ) public {
    s.setUint(ProtoUtilV1.NS_COVER_STATUS, key, value);
  }

  // function setClaimBeginTimestamp(
  //   MockStore s,
  //   bytes32 key,
  //   uint256 value
  // ) public {
  //   s.setUint(ProtoUtilV1.NS_CLAIM_BEGIN_TS, key, value);
  // }

  // function setClaimExpiryTimestamp(
  //   MockStore s,
  //   bytes32 key,
  //   uint256 value
  // ) public {
  //   s.setUint(ProtoUtilV1.NS_CLAIM_EXPIRY_TS, key, value);
  // }
}

contract MockGovernanceStore is MockStore {
  function initialize(bytes32 key) external returns (address) {
address[] memory values = MockGovernanceStoreLib.initialize(this, key);
    // MockProtocol protocol = new MockProtocol();
    // this.setAddress(ProtoUtilV1.CNS_CORE, address(protocol));

    return values[0];
  }


  function setCoverStatus(bytes32 key, uint256 value) external {
    MockGovernanceStoreLib.setCoverStatus(this, key, value);
  }
}
