// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IStableVault {
    function isStable(address stable) external view returns (bool);

    function enable(address stable) external;
    function disable(address stable) external;

    function deposit(address stable, uint256 amount) external;
    function withdraw(address stable, uint256 amount) external;
    function pendingReward(address stable) external view returns (uint256);
    function claimReward(address stable) external;
    function distributeFee(address stable, uint256 fee) external;
    function transferGate(address stable, uint256 amount) external returns (uint256);
}
