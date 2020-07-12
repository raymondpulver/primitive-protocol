// SPDX-License-Identifier: MIT



pragma solidity ^0.6.2;

import { IRegistry } from "../option/interfaces/IRegistry.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { IOverTheCounterOption } from "./interfaces/IOverTheCounterOption.sol";
import { OverTheCounterOption } from "./OverTheCounterOption.sol";
import { IOption } from "../option/interfaces/IOption.sol";
import "@nomiclabs/buidler/console.sol";

contract OtcFactory {
    // otc factory will deploy an option contract
    // and initialize an otc contract
    // while also taking a side on the order
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IRegistry public registry;
    IOverTheCounterOption public otc;
    address public quoteToken;

    //solhint-disable-next-line no-empty-blocks
    constructor() public {}

    function setRegistry(IRegistry _registry) external {
        registry = _registry;
    }

    function setQuoteToken(address _quoteToken) external {
        quoteToken = _quoteToken;
    }

    function sellOtc(
        address underlyingToken,
        address strikeToken,
        uint256 base,
        uint256 quote,
        uint256 expiry,
        uint256 ask,
        uint256 size
    ) external {
        address option = registry.deployOption(
            underlyingToken,
            strikeToken,
            base,
            quote,
            expiry
        );

        otc = new OverTheCounterOption();
        otc.initialize(IOption(option), quoteToken, 0, ask, size);
        address underlying = IOption(option).underlyingToken();
        IERC20(underlying).safeTransferFrom(
            msg.sender,
            address(this),
            IOption(option).base()
        );
        IERC20(underlying).approve(address(otc), 100000 ether);
        console.log(
            IERC20(underlying).balanceOf(address(this)),
            IOption(option).base()
        );
        otc.sell(msg.sender);
    }
}
