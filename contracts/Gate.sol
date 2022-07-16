// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import "./StableVault.sol";
import "./SyntheticVault.sol";
import "./interfaces/IGate.sol";

contract Gate is IGate, Initializable, OwnableUpgradeable {
    address public router;
    address public stableVault;
    address public syntheticVault;

    function initialize(address _router) public initializer {
        __Ownable_init();

        router = _router;

        if (stableVault == address(0)) {
            StableVault _stableVault = new StableVault();
            _stableVault.initialize(address(this));
            _stableVault.transferOwnership(msg.sender);
            stableVault = address(_stableVault);
        }

        if (syntheticVault == address(0)) {
            SyntheticVault _syntheticVault = new SyntheticVault();
            _syntheticVault.initialize(address(this));
            _syntheticVault.transferOwnership(msg.sender);
            syntheticVault = address(_syntheticVault);
        }
    }

    function transferIn(bytes32 guid, address[] calldata path, uint256 amountIn) public override payable {
        address lastToken = path[path.length - 1];
        require(IStableVault(stableVault).isStable(lastToken) || ISyntheticVault(syntheticVault).isSynthetic(lastToken), "INVALID_PATH");

        TransferHelper.safeTransferFrom(path[0], msg.sender, address(this), amountIn);
        TransferHelper.safeApprove(path[0], router, amountIn);

        if (IStableVault(stableVault).isStable(path[0])) {
            TransferHelper.safeTransfer(path[0], stableVault, amountIn);

            emit TransferIn(guid, amountIn);

            return;
        }

        uint256[] memory amountOut = new uint[](path.length);

        if (IUniswapV2Router01(router).WETH() == path[0]) {
            require(amountIn == msg.value, "INVALID_AMOUNT_IN");
            amountOut = IUniswapV2Router01(router).swapExactETHForTokens{value: msg.value}(0, path, stableVault, block.timestamp);
        } else {
            amountOut = IUniswapV2Router01(router).swapExactTokensForTokens(amountIn, 0, path, stableVault, block.timestamp);
        }

        emit TransferIn(guid, amountIn);

        if (ISyntheticVault(syntheticVault).isSynthetic(lastToken)) {
            ISyntheticVault(syntheticVault).burnToken(lastToken, stableVault, amountOut[amountOut.length - 1]);
        }
    }

    function transferOut(
        bytes32 guid,
        address[] calldata path,
        uint256 amountIn,
        address payable target
    ) public override onlyOwner {
        address lastToken = path[path.length - 1];
        uint256 transferOutAmount = 0;

        if (IStableVault(stableVault).isStable(path[0])) {
            amountIn = IStableVault(stableVault).transferGate(path[0], amountIn);
        }

        if (ISyntheticVault(syntheticVault).isSynthetic(path[0])) {
            ISyntheticVault(syntheticVault).mintToken(path[0], address(this), amountIn);
        }

        if (IStableVault(stableVault).isStable(lastToken)) {
            TransferHelper.safeTransfer(path[0], target, amountIn);
            transferOutAmount = amountIn;

            emit TransferOut(guid, target, transferOutAmount);

            return;
        }

        TransferHelper.safeApprove(path[0], router, amountIn);

        if (IUniswapV2Router01(router).WETH() == lastToken) {
            uint256[] memory amounts = IUniswapV2Router01(router).swapExactTokensForETH(
                amountIn, 0, path, target, block.timestamp);
            transferOutAmount = amounts[amounts.length - 1];
        } else {
            uint256[] memory amounts = IUniswapV2Router01(router).swapExactTokensForTokens(
                amountIn, 0, path, target, block.timestamp);
            transferOutAmount = amounts[amounts.length - 1];
        }

        emit TransferOut(guid, target, transferOutAmount);
    }

    receive() external payable {}
}
