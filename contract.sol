// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Math library
import "./abdk.sol";

// ChainLink oracle
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Leverage {
    address public owner;        // address of contract creator
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
    int128 public MAX_RATIO;

    // oracle for ETH/USD price on Kovan network via ChainLink
    AggregatorV3Interface internal priceFeed;

    constructor() {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(0x9326BFA02ADD2366b30bacB125260Af641031331);
        uint four = 4;
        MAX_RATIO = Math.fromUInt(four);
        lastPrice = getPrice();
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

    function updateDivider() public {
        require(d != t && d != 0);

        // get price from oracle
        int128 price = getPrice();
        require(price != lastPrice);

        // calculate amount divider will be moved
        // NOTE: Using MAX_RATIO only because it happens to be 4
        int128 move = Math.mul(Math.div(t, MAX_RATIO), Math.log_2(Math.div(price, lastPrice)));

        // bear liquidations
        if (d < move) {
            d = 0;
            bearTotal = 0;
            // loop over mapping
        }

        // update contract
        d = Math.sub(d, move);
        lastPrice = price;

        // bull liquidations
        if (d > t) {
            d = t;
            bullTotal = 0;
            // loop over mapping
        }
    }

    // deposit ETH and recieve bull lp tokens
    function buyBull() public payable {
        require(msg.value > 0);
        int128 a = Math.fromUInt(msg.value);

        // updateDivider()

        // prevent transactions that lead to big imbalance
        if (t != d && d != 0) {
            require(Math.sub(Math.add(t, a), d) <= Math.mul(MAX_RATIO, d));
        }
        
        // update lp tokens
        if (bullTotal == 0) {
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

    // deposit ETH and recieve bear lp tokens
    function buyBear() public payable {
        require(msg.value > 0);
        int128 a = Math.fromUInt(msg.value);

        // updateDivider()

        // prevent transactions that lead to big imbalance
        if (t != d && d != 0) {
            require(Math.add(d, a) <= Math.mul(MAX_RATIO, Math.sub(t, d)));
        }

        // update lp tokens
        if (bearTotal == 0) {
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

    // sell bull lp tokens and recieve ETH
    // numerator / denominator = fraction of bull LP to sell
    function sellBull(uint numerator, uint denominator) public {
        require(numerator > 0 && denominator > 0);
        require(numerator <= denominator);
        require(bullBalances[msg.sender] > 0);

        // updateDivider()

        // l = lp amount to redeem, e = eth amount to recieve
        int128 l = Math.mul(bullBalances[msg.sender], Math.div(Math.fromUInt(numerator), Math.fromUInt(denominator)));
        int128 e = Math.mul(Math.sub(t, d), Math.div(l, bullTotal));

        // prevent transactions that lead to big imbalance
        if (t != d && d != 0 && Math.sub(Math.sub(t, e), d) != 0) {
            require(d < Math.mul(MAX_RATIO, Math.sub(Math.sub(t, e), d)));
        }

        // update lp tokens
        bullBalances[msg.sender] = Math.sub(bullBalances[msg.sender], l);
        bullTotal = Math.sub(bullTotal, l);

        // transfer eth
        payable(msg.sender).transfer(Math.toUInt(e));
        t = Math.fromUInt(address(this).balance);
    }

    // sell bear bull lp tokens and recieve ETH
    // numerator / denominator = fraction of bear LP to sell
    function sellBear(uint numerator, uint denominator) public {
        require(numerator > 0 && denominator > 0);
        require(numerator <= denominator);
        require(bearBalances[msg.sender] > 0);

        // updateDivider()

        // l = lp amount to redeem, e = eth amount to recieve
        int128 l = Math.mul(bearBalances[msg.sender], Math.div(Math.fromUInt(numerator), Math.fromUInt(denominator)));
        int128 e = Math.mul(d, Math.div(l, bearTotal));

        // prevent transactions that lead to big imbalance
        if (t != d && d != 0 && Math.sub(d, e) != 0) {
            require(Math.sub(t, d) < Math.mul(MAX_RATIO, Math.sub(d, e)));
        }

        // update lp tokens
        bearBalances[msg.sender] = Math.sub(bearBalances[msg.sender], l);
        bearTotal = Math.sub(bearTotal, l);

        // transfer eth
        d = Math.sub(d, e);
        payable(msg.sender).transfer(Math.toUInt(e));
        t = Math.fromUInt(address(this).balance);
    }

    function emergency() public {
        require(msg.sender == owner);
        payable(msg.sender).transfer(address(this).balance);
    }
}

