// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IGate {
    event TransferIn(bytes32 guid, uint256 amount);
    event TransferOut(bytes32 guid, address target, uint256 amount);

    function transferIn(bytes32 guid, address[] calldata path, uint256 amountIn) external payable;
    function transferOut(bytes32 guid, address[] calldata path, uint256 amountIn, address payable target) external;
}
