// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "./interfaces/ISyntheticVault.sol";
import "./ERC20Token.sol";

contract SyntheticVault is ISyntheticVault, Initializable, OwnableUpgradeable {
    address public gate;
    mapping(bytes32 => mapping(bytes32 => address)) public networks;
    mapping(address => bool) synthetics;

    function initialize(address _gate) public initializer {
        __Ownable_init();

        gate = _gate;
    }

    modifier onlyAuthorized() {
        require(owner() == _msgSender() || gate == _msgSender(), "INVALID_CALLER");
        _;
    }

    function isSynthetic(address synthetic) public view override returns (bool) {
        return synthetics[synthetic];
    }

    function create(
        bytes32 networkId,
        bytes32 token,
        string memory symbol,
        string memory name,
        uint8 decimals
    ) public override onlyAuthorized {
        require(networks[networkId][token] == address(0), "ALREADY_EXISTS");
        ERC20Token syntheticToken = new ERC20Token();
        syntheticToken.initialize(symbol, name, decimals);
        networks[networkId][token] = address(syntheticToken);
        synthetics[address(syntheticToken)] = true;
    }

    function get(bytes32 networkId, bytes32 token) public view override returns (address) {
        return networks[networkId][token];
    }

    function mint(
        bytes32 networkId,
        bytes32 token,
        address account,
        uint256 amount
    ) public override onlyAuthorized {
        require(isSynthetic(networks[networkId][token]), "NOT_SYNTHETIC");

        ERC20Token(networks[networkId][token]).mint(account, amount);

        emit SyntheticMint(networks[networkId][token], amount);
    }

    function mintToken(address token, address account, uint256 amount) public override onlyAuthorized {
        require(isSynthetic(token), "NOT_SYNTHETIC");

        ERC20Token(token).mint(account, amount);

        emit SyntheticMint(token, amount);
    }

    function burn(
        bytes32 networkId,
        bytes32 token,
        address account,
        uint256 amount
    ) public override onlyAuthorized {
        require(isSynthetic(networks[networkId][token]), "NOT_SYNTHETIC");

        ERC20Token(networks[networkId][token]).burn(account, amount);

        emit SyntheticBurn(networks[networkId][token], amount);
    }

    function burnToken(address token, address account, uint256 amount) public override onlyAuthorized {
        require(isSynthetic(token), "NOT_SYNTHETIC");

        ERC20Token(token).burn(account, amount);

        emit SyntheticBurn(token, amount);
    }
}
