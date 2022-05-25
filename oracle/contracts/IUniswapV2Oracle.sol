// Neptune Mutual Protocol (https://neptunemutual.com)
// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.6.6;

interface IUniswapV2Oracle {
  function update() external;

  function consult(address token, uint amountIn) external view returns (uint amountOut);
}