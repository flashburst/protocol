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

    uint public constant PERIOD = 1 hours;

    IUniswapV2Pair immutable pair;
    address public immutable token0;
    address public immutable token1;

    uint    public reserve0CumulativeLast;
    uint    public reserve1CumulativeLast;
    uint32  public blockTimestampLast;
    FixedPoint.uq112x112 public reserve0Average;
    FixedPoint.uq112x112 public reserve1Average;

    uint public reserve0;
    uint public reserve1;

    constructor(address factory, address tokenA, address tokenB) public {
        IUniswapV2Pair _pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, tokenA, tokenB));
        pair = _pair;
        token0 = _pair.token0();
        token1 = _pair.token1();
        // price0CumulativeLast = _pair.price0CumulativeLast(); // fetch the current accumulated price value (1 / 0)
        // price1CumulativeLast = _pair.price1CumulativeLast(); // fetch the current accumulated price value (0 / 1)
        (reserve0, reserve1, blockTimestampLast) = _pair.getReserves();
        require(reserve0 != 0 && reserve1 != 0, 'ExampleOracleSimple: NO_RESERVES'); // ensure that there's liquidity in the pair

        blockTimestampLast = uint32(blockTimestampLast % 2**32);
        reserve0CumulativeLast += uint(reserve0) * blockTimestampLast;
        reserve1CumulativeLast += uint(reserve1) * blockTimestampLast;
    }

    function update() external override {
        (reserve0, reserve1, blockTimestampLast) = pair.getReserves();

        require(reserve0 != 0 && reserve1 != 0, 'ExampleOracleSimple: NO_RESERVES'); // ensure that there's liquidity in the pair

        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

        require(timeElapsed >= PERIOD, 'ExampleOracleSimple: PERIOD_NOT_ELAPSED');

        uint reserve0Cumulative = reserve0CumulativeLast;
        uint reserve1Cumulative = reserve1CumulativeLast;

        if (blockTimestampLast != blockTimestamp) {        
            reserve0Cumulative += uint(reserve0) * timeElapsed;
            reserve1Cumulative += uint(reserve1) * timeElapsed;
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