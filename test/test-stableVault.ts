import {gateFixture, stableVaultFixture, uniswapRouterFixture, UniswapTokens, uniswapTokensFixture,} from "./fixture";
import {Contract} from "ethers";
import {ethers} from "hardhat";
import {expect} from "chai";
import {parseUnits} from "ethers/lib/utils";

let tokens: UniswapTokens;
let stableVault: Contract;

describe('StableVault', () => {
    beforeEach(async () => {
        const [_, user1, user2, user3] = await ethers.getSigners();
        tokens = await uniswapTokensFixture();
        const router = await uniswapRouterFixture(null, tokens.WETH.address);
        const gate = await gateFixture(router.address);
        stableVault = await stableVaultFixture(gate);

        for (const user of [user1, user2, user3]) {
            await tokens.USDC.connect(user).approve(stableVault.address, ethers.constants.MaxUint256);
        }
    });

    it('enable disable', async () => {
        const stableInfoBeforeEnable = await stableVault.stables(tokens.USDC.address);
        await stableVault.enable(tokens.USDC.address);
        const stableInfoAfterEnable = await stableVault.stables(tokens.USDC.address);

        expect(stableInfoBeforeEnable.isEnabled).to.false;
        expect(stableInfoAfterEnable.isEnabled).to.true;

        await stableVault.disable(tokens.USDC.address);
        const stableInfoAfterDisable = await stableVault.stables(tokens.USDC.address);

        expect(stableInfoAfterDisable.isEnabled).to.false;
    });

    it('deposit withdraw fees', async () => {
        const [_, user1, user2, user3] = await ethers.getSigners();
        const user1Amount = parseUnits("100", 6);
        const user2Amount = parseUnits("100", 6);
        const user3Amount = parseUnits("100", 6);

        await stableVault.enable(tokens.USDC.address);
        await stableVault.setFees(0, 0);

        await stableVault.connect(user1).deposit(tokens.USDC.address, user1Amount);
        await stableVault.connect(user2).deposit(tokens.USDC.address, user2Amount);
        await stableVault.distributeFee(tokens.USDC.address, parseUnits("2", 6));
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("1", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("1", 6));

        await stableVault.distributeFee(tokens.USDC.address, parseUnits("4", 6));
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("3", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("3", 6));

        await stableVault.connect(user3).deposit(tokens.USDC.address, user3Amount);
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("3", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("3", 6));
        expect(await stableVault.connect(user3).pendingReward(tokens.USDC.address)).to.eq(parseUnits("0", 6));

        await stableVault.distributeFee(tokens.USDC.address, parseUnits("3", 6));
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("4", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("4", 6));
        expect(await stableVault.connect(user3).pendingReward(tokens.USDC.address)).to.eq(parseUnits("1", 6));

        await stableVault.connect(user1).deposit(tokens.USDC.address, user1Amount);
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("0", 6));
        expect(await stableVault.connect(user1).paidFees(tokens.USDC.address)).to.eq(parseUnits("4", 6));

        await stableVault.distributeFee(tokens.USDC.address, parseUnits("4", 6));
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("2", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("5", 6));
        expect(await stableVault.connect(user3).pendingReward(tokens.USDC.address)).to.eq(parseUnits("2", 6));

        await stableVault.connect(user1).withdraw(tokens.USDC.address, user1Amount);
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("0", 6));
        expect(await stableVault.connect(user1).paidFees(tokens.USDC.address)).to.eq(parseUnits("6", 6));

        await stableVault.distributeFee(tokens.USDC.address, parseUnits("3", 6));
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("1", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("6", 6));
        expect(await stableVault.connect(user3).pendingReward(tokens.USDC.address)).to.eq(parseUnits("3", 6));

        await stableVault.connect(user3).withdraw(tokens.USDC.address, user3Amount);
        expect(await stableVault.connect(user3).pendingReward(tokens.USDC.address)).to.eq(parseUnits("0", 6));
        expect(await stableVault.connect(user3).paidFees(tokens.USDC.address)).to.eq(parseUnits("3", 6));

        await stableVault.distributeFee(tokens.USDC.address, parseUnits("4", 6));
        expect(await stableVault.connect(user1).pendingReward(tokens.USDC.address)).to.eq(parseUnits("3", 6));
        expect(await stableVault.connect(user1).paidFees(tokens.USDC.address)).to.eq(parseUnits("6", 6));
        expect(await stableVault.connect(user2).pendingReward(tokens.USDC.address)).to.eq(parseUnits("8", 6));
        expect(await stableVault.connect(user2).paidFees(tokens.USDC.address)).to.eq(parseUnits("0", 6));
        expect(await stableVault.connect(user3).pendingReward(tokens.USDC.address)).to.eq(parseUnits("0", 6));
        expect(await stableVault.connect(user3).paidFees(tokens.USDC.address)).to.eq(parseUnits("3", 6));
    });
});