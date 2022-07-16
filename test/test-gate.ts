import {BigNumber, Contract} from "ethers";
import {
    gateFixture,
    stableVaultFixture,
    SyntheticTokens,
    syntheticTokensFixture,
    syntheticVaultFixture,
    uniswapFactoryFixture,
    uniswapRouterFixture,
    UniswapTokens,
    uniswapTokensFixture,
} from "./fixture";
import {ethers} from "hardhat";
import {parseUnits} from "ethers/lib/utils";
import {expect} from "chai";
import {addRouterSyntheticsLiquidity, addRouterTokensLiquidity, addStableVaultLiquidity} from "./util";

let tokens: UniswapTokens;
let syntheticTokens: SyntheticTokens;
let gate: Contract;
let stableVault: Contract;

describe('Gate', () => {
    const guid = ethers.utils.hexZeroPad("0xa82a25623328429988849d53dee6011d", 32);

    beforeEach(async () => {
        tokens = await uniswapTokensFixture();
        const factory = await uniswapFactoryFixture();
        const router = await uniswapRouterFixture(factory.address, tokens.WETH.address);
        await addRouterTokensLiquidity(router, tokens);
        gate = await gateFixture(router.address);
        await addStableVaultLiquidity(gate, tokens);

        const syntheticVault = await syntheticVaultFixture(gate);
        syntheticTokens = await syntheticTokensFixture(syntheticVault);
        stableVault = await stableVaultFixture(gate);

        await addRouterSyntheticsLiquidity(router, tokens, syntheticTokens);
    });

    it('transferInToken', async () => {
        const [_, user1] = await ethers.getSigners();
        const balanceBefore = await tokens.USDC.balanceOf(stableVault.address);
        await tokens.UNI.connect(user1).approve(gate.address, ethers.constants.MaxUint256);
        const amountIn = parseUnits("10", 18);

        const transferInTx = await gate.connect(user1).transferIn(
            guid,
            [tokens.UNI.address, tokens.USDC.address],
            amountIn,
        );

        const balanceAfter = await tokens.USDC.balanceOf(stableVault.address);
        const newStable = balanceAfter.sub(balanceBefore);

        expect(newStable).to.be.lt(parseUnits("98.7", 6));
        expect(newStable).to.be.gt(parseUnits("98.6", 6));

        expect(transferInTx).to
            .emit(gate, 'TransferIn')
            .withArgs(guid, amountIn);
    });

    it('transferInStable', async () => {
        const [_, user1] = await ethers.getSigners();
        const balanceBefore = await tokens.USDC.balanceOf(stableVault.address);
        await tokens.USDC.connect(user1).approve(gate.address, ethers.constants.MaxUint256);
        const amountIn = parseUnits("100", 6);

        const transferInTx = await gate.connect(user1).transferIn(
            guid,
            [tokens.USDC.address],
            amountIn,
        );

        const balanceAfter = await tokens.USDC.balanceOf(stableVault.address);
        const newStable = balanceAfter.sub(balanceBefore);

        expect(newStable).to.eq(amountIn);

        expect(transferInTx).to
            .emit(gate, 'TransferIn')
            .withArgs(guid, amountIn);
    });

    it('transferInNative', async () => {
        const [_, user1] = await ethers.getSigners();
        const balanceBefore = await tokens.USDC.balanceOf(stableVault.address);
        await tokens.WETH.connect(user1).approve(gate.address, ethers.constants.MaxUint256);
        const amountIn = parseUnits("0.1", 18);

        const transferInTx = await gate.connect(user1).transferIn(
            guid,
            [tokens.WETH.address, tokens.USDC.address],
            amountIn,
            {value: amountIn}
        );

        const balanceAfter = await tokens.USDC.balanceOf(stableVault.address);
        const newStable = balanceAfter.sub(balanceBefore);

        expect(newStable).to.be.lt(parseUnits("294.3", 6));
        expect(newStable).to.be.gt(parseUnits("294.2", 6));

        expect(transferInTx).to
            .emit(gate, 'TransferIn')
            .withArgs(guid, amountIn);
    });

    it('transferInSynthetic', async () => {
        const [_, user1] = await ethers.getSigners();
        const balanceBefore = await tokens.USDC.balanceOf(stableVault.address);
        await tokens.UNI.connect(user1).approve(gate.address, ethers.constants.MaxUint256);
        const amountIn = parseUnits("40", 18);
        const syntheticVault = await syntheticVaultFixture(gate);

        const transferInTx = await gate.connect(user1).transferIn(
            guid,
            [tokens.UNI.address, tokens.USDC.address, syntheticTokens.pBTC.address],
            amountIn,
            {value: amountIn}
        );

        const balanceAfter = await tokens.USDC.balanceOf(stableVault.address);
        const newStable = balanceAfter.sub(balanceBefore);
        const stableVaultBTCBalance = await syntheticTokens.pBTC.balanceOf(stableVault.address);

        expect(newStable).to.eq(0);
        expect(stableVaultBTCBalance).to.eq(0);

        expect(transferInTx).to
            .emit(gate, 'TransferIn')
            .withArgs(guid, amountIn);

        expect(transferInTx).to
            .emit(syntheticVault, 'SyntheticBurn')
            .withArgs(syntheticTokens.pBTC.address, "922561");
    });

    it('transferOutToken', async () => {
        const [owner] = await ethers.getSigners();
        const ownerBalanceBefore = await tokens.UNI.balanceOf(owner.address);
        const transferOutTx = await gate.transferOut(
            guid,
            [tokens.USDC.address, tokens.UNI.address],
            parseUnits("50", 6),
            owner.address,
        );

        const ownerBalanceAfter = await tokens.UNI.balanceOf(owner.address);

        expect(ownerBalanceBefore).to.eq(0);
        expect(ownerBalanceAfter).to.be.lt(parseUnits("4.96", 18));
        expect(ownerBalanceAfter).to.be.gt(parseUnits("4.95", 18));

        expect(transferOutTx).to
            .emit(gate, 'TransferOut')
            .withArgs(guid, owner.address, ownerBalanceAfter);
    });

    it('transferOutStable', async () => {
        const [owner] = await ethers.getSigners();
        const ownerBalanceBefore = await tokens.USDC.balanceOf(owner.address);
        const transferOutTx = await gate.transferOut(
            guid,
            [tokens.USDC.address],
            parseUnits("50", 6),
            owner.address,
        );

        const ownerBalanceAfter = await tokens.USDC.balanceOf(owner.address);

        expect(ownerBalanceBefore).to.eq(0);
        expect(ownerBalanceAfter).to.be.lt(parseUnits("49.96", 6));
        expect(ownerBalanceAfter).to.be.gt(parseUnits("49.95", 6));

        expect(transferOutTx).to
            .emit(gate, 'TransferOut')
            .withArgs(guid, owner.address, ownerBalanceAfter);
    });

    it('transferOutNative', async () => {
        const [owner] = await ethers.getSigners();
        const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

        const transferOutTx = await gate.transferOut(
            guid,
            [tokens.USDC.address, tokens.WETH.address],
            parseUnits("300", 6),
            owner.address,
        );

        const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
        const ownerReceivedEther = ownerBalanceAfter.sub(ownerBalanceBefore);

        expect(ownerReceivedEther).to.be.lt(parseUnits("0.098", 18));
        expect(ownerReceivedEther).to.be.gt(parseUnits("0.097", 18));

        expect(transferOutTx).to
            .emit(gate, 'TransferOut')
            .withArgs(guid, owner.address, "97983574940764207");
    });

    it('transferOutSynthetic', async () => {
        const [owner] = await ethers.getSigners();
        const ownerBalanceBefore = await tokens.UNI.balanceOf(owner.address);
        const syntheticVault = await syntheticVaultFixture(gate);
        const amountIn = parseUnits("0.001", 8);

        const transferOutTx = await gate.transferOut(
            guid,
            [syntheticTokens.pBTC.address, tokens.USDC.address, tokens.UNI.address],
            amountIn,
            owner.address,
        );

        const ownerBalanceAfter = await tokens.UNI.balanceOf(owner.address);

        expect(ownerBalanceBefore).to.eq(0);
        expect(ownerBalanceAfter).to.be.lt(parseUnits("3.95", 18));
        expect(ownerBalanceAfter).to.be.gt(parseUnits("3.94", 18));

        expect(transferOutTx).to
            .emit(gate, 'TransferOut')
            .withArgs(guid, owner.address, "3945493293976049004");

        expect(transferOutTx).to
            .emit(syntheticVault, 'SyntheticMint')
            .withArgs(syntheticTokens.pBTC.address, amountIn);
    });
});
