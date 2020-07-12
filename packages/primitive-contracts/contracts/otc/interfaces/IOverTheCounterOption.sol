// SPDX-License-Identifier: MIT



pragma solidity ^0.6.2;

import { IOption } from "../../option/interfaces/IOption.sol";

interface IOverTheCounterOption {
    function initialize(
        IOption _option,
        address _quoteToken,
        uint256 _bid,
        uint256 _ask,
        uint256 _size
    ) external;

    function buy() external returns (bool);

    function sell(address from) external returns (bool);
}
