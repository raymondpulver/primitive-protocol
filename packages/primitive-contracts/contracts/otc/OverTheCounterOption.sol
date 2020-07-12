// SPDX-License-Identifier: MIT



pragma solidity ^0.6.2;

/**
 * @title Manages OTC option contracts
 * @author Primitive
 */

import { IOption } from "../option/interfaces/IOption.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IOverTheCounterOption } from "./interfaces/IOverTheCounterOption.sol";

contract OverTheCounterOption is
    IOverTheCounterOption,
    ReentrancyGuard,
    Pausable
{
    // buy or sell side can make an otc contract
    // buy means they put up a bid price and size of position they want
    // sell means they put up the cover and have an ask * position price they want
    // either party can join a side
    // if a party joins a side, and one side is already filled, its atomically settled
    // if a party doesnt join, the party that is in the contract can leave and pull funds out

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    event Buy(address indexed from, bool indexed settled);

    struct Parties {
        address buyer;
        address seller;
        address quoteToken;
    }

    struct Parameters {
        uint256 bid;
        uint256 ask;
        uint256 size;
    }

    struct Status {
        bool buyFilled;
        bool sellFilled;
    }

    /* struct Otc {
        Parties parties;
        Parameters params;
        Status status;
    } */

    // assume the option is tied to the OTC option at deployment
    IOption public option;
    /* address public quoteToken;
    address public buyer;
    address public seller;

    uint256 public bid;
    uint256 public ask;
    uint256 public size;

    bool public buyFilled;
    bool public sellFilled; */

    /* Otc public otc; */
    Parties public parties;
    Parameters public params;
    Status public status;

    //solhint-disable-next-line no-empty-blocks

    constructor() public {}

    function initialize(
        IOption _option,
        address _quoteToken,
        uint256 _bid,
        uint256 _ask,
        uint256 _size
    ) external override {
        require(params.bid == 0 || params.ask == 0, "ERR_INITIALIZED");
        option = _option;
        parties.quoteToken = _quoteToken;
        params = Parameters({ bid: _bid, ask: _ask, size: _size });
    }

    function setSize(uint256 _size) external {
        params.size = _size;
    }

    function setQuoteToken(address _quoteToken) external {
        parties.quoteToken = _quoteToken;
    }

    /**
     * @dev Takes buy side.
     */
    function buy() external override returns (bool) {
        IERC20(parties.quoteToken).safeTransferFrom(
            msg.sender,
            address(this),
            params.bid.mul(params.size)
        );
        parties.buyer = msg.sender;
        if (status.sellFilled) {
            IERC20(option.underlyingToken()).safeTransfer(
                address(option),
                option.base()
            );
            option.mint(address(this));
            emit Buy(msg.sender, true);
            status.buyFilled = true;
            return settle();
        } else {
            status.buyFilled = true;
            return true;
        }
    }

    /**
     * @dev Takes sell side.
     */
    function sell(address from) external override returns (bool) {
        parties.seller = from;
        address underlyingToken = option.underlyingToken();
        uint256 base = option.base();
        if (status.buyFilled) {
            // execute settlement
            IERC20(underlyingToken).safeTransferFrom(
                msg.sender,
                address(option),
                base
            );
            option.mint(address(this));
            return settle();
        } else {
            IERC20(underlyingToken).safeTransferFrom(
                msg.sender,
                address(this),
                base
            );
            status.sellFilled = true;
            return true;
        }
    }

    function settle() private returns (bool) {
        // send payment to seller
        address _quoteToken = parties.quoteToken;
        address _redeemToken = option.redeemToken();
        address seller = parties.seller;

        uint256 quoteBalance = IERC20(_quoteToken).balanceOf(address(this));
        uint256 optionBalance = IERC20(address(option)).balanceOf(
            address(this)
        );
        uint256 size = params.size;
        require(params.bid.mul(size) >= quoteBalance, "ERR_QUOTE_BAL");
        require(optionBalance >= params.size, "ERR_OPTION_BAL");
        IERC20(_quoteToken).safeTransfer(seller, quoteBalance);
        // send option to parties.buyer
        IERC20(address(option)).safeTransfer(parties.buyer, optionBalance);
        // send redeem to parties.seller
        IERC20(_redeemToken).safeTransfer(
            seller,
            IERC20(_redeemToken).balanceOf(address(this))
        );
        return true;
    }

    function sellFilled() public view returns (bool) {
        return status.sellFilled;
    }

    function buyFilled() public view returns (bool) {
        return status.buyFilled;
    }

    function sellBalance() public view returns (uint256 balance) {
        balance = IERC20(option.underlyingToken()).balanceOf(address(this));
    }
}
