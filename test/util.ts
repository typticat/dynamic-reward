import {ethers} from "hardhat";
import {parseEther, parseUnits} from "ethers/lib/utils";
import {stableVaultFixture, SyntheticTokens, UniswapTokens} from "./fixture";
import {Contract} from "ethers";

export async function addRouterTokensLiquidity(router: Contract, tokens: UniswapTokens) {
    const [_, user1, user2, user3] = await ethers.getSigners();

    for (const user of [user1, user2, user3]) {
        await tokens.USDC.connect(user).approve(router.address, ethers.constants.MaxUint256);
        await tokens.WETH.connect(user).approve(router.address, ethers.constants.MaxUint256);

        await router.connect(user).addLiquidityETH(
            tokens.USDC.address,
            parseUnits("3000", 6),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
            {value: parseEther("1")},
        );

        await router.connect(user).addLiquidity(
            tokens.USDC.address,
            tokens.WETH.address,
            parseUnits("3000", 6),
            parseUnits("1", 18),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
        );

        await tokens.UNI.connect(user).approve(router.address, ethers.constants.MaxUint256);
        await router.connect(user).addLiquidity(
            tokens.USDC.address,
            tokens.UNI.address,
            parseUnits("3000", 6),
            parseUnits("300", 18),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
        );

        await tokens.LINK.connect(user).approve(router.address, ethers.constants.MaxUint256);
        await router.connect(user).addLiquidity(
            tokens.USDC.address,
            tokens.LINK.address,
            parseUnits("3000", 6),
            parseUnits("100", 18),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
        );

        await tokens.AAVE.connect(user).approve(router.address, ethers.constants.MaxUint256);
        await router.connect(user).addLiquidity(
            tokens.USDC.address,
            tokens.AAVE.address,
            parseUnits("3000", 6),
            parseUnits("20", 18),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
        );
    }
}

export async function addRouterSyntheticsLiquidity(
    router: Contract,
    tokens: UniswapTokens,
    syntheticTokens: SyntheticTokens,
) {
    const [_, user1, user2, user3] = await ethers.getSigners();

    for (const user of [user1, user2, user3]) {
        syntheticTokens.pBTC.connect(user).approve(router.address, ethers.constants.MaxUint256);
        await router.connect(user).addLiquidity(
            tokens.USDC.address,
            syntheticTokens.pBTC.address,
            parseUnits("4000", 6),
            parseUnits("0.1", 8),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
        );

        syntheticTokens.pXMR.connect(user).approve(router.address, ethers.constants.MaxUint256);
        await router.connect(user).addLiquidity(
            tokens.USDC.address,
            syntheticTokens.pXMR.address,
            parseUnits("3000", 6),
            parseUnits("20", 12),
            0,
            0,
            user.address,
            ethers.constants.MaxUint256,
        );
    }
}

export async function addStableVaultLiquidity(gate: Contract, tokens: UniswapTokens) {
    const [_, user1, user2, user3] = await ethers.getSigners();
    const stableVault = await stableVaultFixture(gate)

    await stableVault.enable(tokens.USDC.address);

    for (const user of [user1, user2, user3]) {
        await tokens.USDC.connect(user).approve(stableVault.address, ethers.constants.MaxUint256);
        await stableVault.connect(user).deposit(tokens.USDC.address, parseUnits("1000", 6));
    }

    return stableVault;
}
