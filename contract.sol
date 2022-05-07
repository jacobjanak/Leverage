// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Math library
import "./abdk.sol";

// ChainLink oracle
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Leverage {
    address public owner;       // address of contract creator
    int128 private lastPrice;    // last eth/usd price retrieved by oracle
    int128 private t;            // total eth in contract
    int128 private d;            // divider where 0 <= d <= t

    // total LP token counts
    int128 private bullTotal;
    int128 private bearTotal;

    // balances of LP tokens per user
    mapping (address => int128) private bullBalances;
    mapping (address => int128) private bearBalances;

    // reject deposits/withdrawals that cause pool exceed this ratio
    uint constant public MAX_RATIO = 4;

    // oracle for ETH/USD price on Kovan network via ChainLink
    AggregatorV3Interface internal priceFeed;

    constructor() {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);

        // initialize all numeric values with zero 64x64
        uint zero = 0;
        t = Math.fromUInt(zero);
        d = Math.fromUInt(zero);
        bullTotal = Math.fromUInt(zero);
        bearTotal = Math.fromUInt(zero);
    }

    // view functions
    function getEthTotal() public view returns (uint) { return address(this).balance; }
    function getLastPrice() public view returns (uint) { return Math.toUInt(lastPrice); }
    function getBullEth() public view returns (uint) { return Math.toUInt(Math.sub(t, d)); }
    function getBearEth() public view returns (uint) { return Math.toUInt(d); }
    function getBullTotal() public view returns (uint) { return Math.toUInt(bullTotal); }
    function getBearTotal() public view returns (uint) { return Math.toUInt(bearTotal); }
    function getBalanceBull() public view returns (uint) { return Math.toUInt(bullBalances[msg.sender]); }
    function getBalanceBear() public view returns (uint) { return Math.toUInt(bearBalances[msg.sender]); }

    // get latest ETH/USD price from ChainLink oracle
    function getPrice() public view returns (int128) {
        ( ,int price,,, ) = priceFeed.latestRoundData(); // NOTE: can we make this less ugly?
        return Math.fromInt(price);
    }

    // function updateDivider() public pure returns (int64) {
    //     require(d != t && Math.toUInt(d) != 0);
    //     int128 price = getPrice();
    //     // require(price != lastPrice);
    //     lastPrice = price;
    // }

    function buyBull() public payable {
        require(msg.value > 0);
        int128 a = Math.fromUInt(msg.value);

        // updateDivider()

        // prevent transactions that lead to big imbalance
        if (t != d && Math.toInt(d) != 0) {
            require(Math.toUInt(Math.sub(Math.add(t, a), d)) <= MAX_RATIO * Math.toUInt(d));
        }
        
        // update lp tokens
        if (Math.toUInt(bullTotal) == 0) {
            uint one = 1;
            bullTotal = Math.fromUInt(one);
            bullBalances[msg.sender] = Math.fromUInt(one);
        } else {
            int128 lpTokens = Math.div(Math.mul(a, bullTotal), Math.sub(t, d));
            bullTotal = Math.add(bullTotal, lpTokens);
            bullBalances[msg.sender] = Math.add(bullBalances[msg.sender], lpTokens);
        }

        // add eth to contract. I could do t = Math.add(t, a);
        t = Math.fromUInt(address(this).balance);
    }

    function buyBear() public payable {
        require(msg.value > 0);
        int128 a = Math.fromUInt(msg.value);

        // updateDivider()

        // prevent transactions that lead to big imbalance
        if (t != d && Math.toInt(d) != 0) {
            require(Math.toUInt(Math.add(d, a)) <= MAX_RATIO * Math.toUInt(Math.sub(t, d)));
        }

        // update lp tokens
        if (Math.toUInt(bearTotal) == 0) {
            uint one = 1;
            bearTotal = Math.fromUInt(one);
            bearBalances[msg.sender] = Math.fromUInt(one);
        } else {
            int128 lpTokens = Math.div(Math.mul(a, bearTotal), d);
            bearTotal = Math.add(bearTotal, lpTokens);
            bearBalances[msg.sender] = Math.add(bearBalances[msg.sender], lpTokens);
        }

        // add eth to contract. I could do t = Math.add(t, a);
        d = Math.add(d, a);
        t = Math.fromUInt(address(this).balance);
    }

    // function sellBull
    // function sellBear
}

