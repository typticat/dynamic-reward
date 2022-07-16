// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "./interfaces/IStableVault.sol";

contract StableVault is IStableVault, Initializable, OwnableUpgradeable {
    struct StableUserInfo {
        uint256 amount;
        uint256 lastAccPerShare;
        uint256 paidFees;
    }

    struct StableInfo {
        uint256 amount;
        uint256 actualAmount;
        uint256 fees;
        uint256 accPerShare;
        bool isEnabled;
        mapping(address => StableUserInfo) users;
    }

    address public gate;
    mapping(address => StableInfo) public stables;
    uint256 public withdrawFee; // in base points
    uint256 public transferGateFee; // in base points

    function initialize(address _gate) public initializer {
        __Ownable_init();

        gate = _gate;
        withdrawFee = 20;
        transferGateFee = 9;
    }

    modifier onlyAuthorized() {
        require(owner() == _msgSender() || gate == _msgSender(), "INVALID_CALLER");
        _;
    }

    function setFees(uint256 _withdrawFee, uint256 _transferGateFee) public onlyAuthorized {
        withdrawFee = _withdrawFee;
        transferGateFee = _transferGateFee;
    }

    function isStable(address stable) public view override returns(bool) {
        return stables[stable].isEnabled;
    }

    function enable(address stable) external override onlyAuthorized {
        stables[stable].isEnabled = true;
    }

    function disable(address stable) external override onlyAuthorized {
        stables[stable].isEnabled = false;
    }

    function deposit(address stable, uint256 amount) public override {
        require(isStable(stable), "INVALID_STABLE");
        claimReward(stable);

        stables[stable].amount += amount;
        stables[stable].users[msg.sender].amount += amount;

        TransferHelper.safeTransferFrom(stable, msg.sender, address(this), amount);
    }

    function withdraw(address stable, uint256 amount) public override {
        require(isStable(stable), "INVALID_STABLE");
        require(amount <= stables[stable].users[msg.sender].amount, "INVALID_AMOUNT");
        claimReward(stable);

        uint256 withdrawFeeAmount = withdrawFee * amount / 1e4;
        amount -= withdrawFeeAmount;

        stables[stable].amount -= amount;
        stables[stable].users[msg.sender].amount -= amount;
        TransferHelper.safeTransfer(stable, msg.sender, amount);

        _distributeFee(stable, withdrawFeeAmount);
    }

    function pendingReward(address stable) public override view returns (uint256) {
        uint256 newAccPerShare = stables[stable].accPerShare - stables[stable].users[msg.sender].lastAccPerShare;

        return newAccPerShare * stables[stable].users[msg.sender].amount / 1e36;
    }

    function paidFees(address stable) public view returns (uint256) {
        return stables[stable].users[msg.sender].paidFees;
    }

    function claimReward(address stable) public override {
        require(isStable(stable), "INVALID_STABLE");

        stables[stable].users[msg.sender].paidFees += pendingReward(stable);
        TransferHelper.safeTransfer(stable, msg.sender, pendingReward(stable));

        stables[stable].users[msg.sender].lastAccPerShare = stables[stable].accPerShare;
    }

    function distributeFee(address stable, uint256 fee) public override onlyAuthorized {
        _distributeFee(stable, fee);
    }

    function _distributeFee(address stable, uint256 fee) private {
        require(isStable(stable), "INVALID_STABLE");

        stables[stable].accPerShare += fee * 1e36 / stables[stable].amount;
    }

    function transferGate(address stable, uint256 amount) public override onlyAuthorized returns (uint256) {
        require(isStable(stable), "INVALID_STABLE");

        uint256 transferFeeAmount = transferGateFee * amount / 1e4;
        amount -= transferFeeAmount;
        _distributeFee(stable, transferFeeAmount);

        TransferHelper.safeTransfer(stable, gate, amount);

        return amount;
    }
}
