// Neptune Mutual Protocol (https://neptunemutual.com)
// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.0;

interface IUniswapV2Oracle {
  function update() external;

  function consult(address token, uint amountIn) external view returns (uint amountOut);
}