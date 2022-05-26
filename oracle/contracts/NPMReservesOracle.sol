// SPDX-License-Identifier: GPL-3.0
pragma solidity =0.6.6;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import '@uniswap/lib/contracts/libraries/FixedPoint.sol';

import '../libraries/UniswapV2OracleLibrary.sol';
import '../libraries/UniswapV2Library.sol';
import './IUniswapV2Oracle.sol';

contract NPMReservesOracle is IUniswapV2Oracle{
    using FixedPoint for *;

    uint public constant PERIOD = 10 minutes;

    IUniswapV2Pair pair;
    address public token0;
    address public token1;

    uint256    public reserve0CumulativeLast;
    uint256    public reserve1CumulativeLast;
    uint32  public blockTimestampLast;
    FixedPoint.uq112x112 public reserve0Average;
    FixedPoint.uq112x112 public reserve1Average;

    uint32  public blockTimestampLastInternal;
    uint256 public reserve0;
    uint256 public reserve1;

    constructor(address factory, address tokenA, address tokenB) public {
        IUniswapV2Pair _pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, tokenA, tokenB));
        pair = _pair;
        token0 = _pair.token0();
        token1 = _pair.token1();

        (reserve0, reserve1, blockTimestampLast) = _pair.getReserves();
        require(reserve0 != 0 && reserve1 != 0, 'ExampleOracleSimple: NO_RESERVES'); // ensure that there's liquidity in the pair

        update();
    }

    function currentBlockTimestamp() internal view returns (uint32) {
        return uint32(block.timestamp % 2 ** 32);
    }

    function currentCumulativeReserves() internal returns (uint256 reserve0Cumulative, uint256 reserve1Cumulative, uint32 blockTimestamp) {
        blockTimestamp = currentBlockTimestamp();
        reserve0Cumulative = reserve0CumulativeLast;
        reserve1Cumulative = reserve1CumulativeLast;

        // if time has elapsed since the last update on the pair, mock the accumulated price values
        (reserve0, reserve1, blockTimestampLastInternal) = IUniswapV2Pair(pair).getReserves();
        if (blockTimestampLastInternal != blockTimestamp) {
            // subtraction overflow is desired
            uint32 timeElapsed = blockTimestamp - blockTimestampLastInternal;
            // addition overflow is desired
            // counterfactual
            reserve0Cumulative += uint256(reserve0) * timeElapsed;
            // counterfactual
            reserve1Cumulative += uint256(reserve1) * timeElapsed;
        }
    }

    function update() public override {
        (uint256 reserve0Cumulative, uint256 reserve1Cumulative, uint32  blockTimestamp) = currentCumulativeReserves();

        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

        if(timeElapsed < PERIOD){
            return;
        }

        reserve0Average = FixedPoint.uq112x112(uint224((reserve0Cumulative - reserve0CumulativeLast) / timeElapsed));
        reserve1Average = FixedPoint.uq112x112(uint224((reserve1Cumulative - reserve1CumulativeLast) / timeElapsed));

        reserve0CumulativeLast = reserve0Cumulative;
        reserve1CumulativeLast = reserve1Cumulative;
        blockTimestampLast = blockTimestamp;
    }

    // note this will always return 0 before update has been called successfully for the first time.
    function consult(address token, uint amountIn) external view override returns (uint amountOut) {
        if (token == token0) {
            amountOut = reserve0Average.mul(amountIn).decode144();
        } else {
            require(token == token1, 'ExampleOracleSimple: INVALID_TOKEN');
            amountOut = reserve1Average.mul(amountIn).decode144();
        }
    }
}