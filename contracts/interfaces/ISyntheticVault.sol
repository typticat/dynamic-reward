// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface ISyntheticVault {
    event SyntheticMint(address synthetic, uint256 amount);
    event SyntheticBurn(address synthetic, uint256 amount);

    function isSynthetic(address synthetic) external view returns (bool);

    function create(bytes32 networkId, bytes32 token, string memory symbol, string memory name, uint8 decimals) external;
    function get(bytes32 networkId, bytes32 token) external view returns (address);
    function mint(bytes32 networkId, bytes32 token, address account, uint256 amount) external;
    function mintToken(address synthetic, address account, uint256 amount) external;
    function burn(bytes32 networkId, bytes32 token, address account, uint256 amount) external;
    function burnToken(address synthetic, address account, uint256 amount) external;
}
