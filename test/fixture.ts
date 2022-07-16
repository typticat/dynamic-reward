import {ethers, upgrades} from "hardhat";
import {Contract} from "ethers";
import {parseEther, parseUnits} from "ethers/lib/utils";

export interface UniswapTokens {
    WETH: Contract
    USDC: Contract
    UNI: Contract
    LINK: Contract
    AAVE: Contract
}

export interface SyntheticTokens {
    pBTC: Contract
    pXMR: Contract
}

export async function wrappedFixture() {
    const WETH = await ethers.getContractFactory("WETH");
    const weth = await WETH.deploy();
    await weth.deployed();

    return weth;
}

export async function tokenFixture(symbol: string, name: string, decimals: number) {
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const erc20Token = await upgrades.deployProxy(ERC20Token, [name, symbol, decimals]);
    await erc20Token.deployed();

    return erc20Token;
}

export async function uniswapTokensFixture(): Promise<UniswapTokens> {
    const [_, user1, user2, user3] = await ethers.getSigners();

    const WETH = await wrappedFixture();
    const USDC = await tokenFixture("USDC", "USD Coin", 6);
    const UNI = await tokenFixture("UNI", "Uniswap", 18);
    const LINK = await tokenFixture("LINK", "ChainLink Token", 18);
    const AAVE = await tokenFixture("AAVE", "AAVE Token", 18);

    for (const user of [user1, user2, user3]) {
        await WETH.connect(user).deposit({value: parseEther("10")});
        await USDC.mint(user.address, parseUnits("100000", 6));
        await UNI.mint(user.address, parseUnits("10000", 18));
        await LINK.mint(user.address, parseUnits("10000", 18));
        await AAVE.mint(user.address, parseUnits("10000", 18));
    }

    return { WETH, USDC, UNI, LINK, AAVE };
}

export async function uniswapFactoryFixture() {
    const [owner] = await ethers.getSigners();

    const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
    const factory = await UniswapV2Factory.deploy(owner.address);
    await factory.deployed();

    return factory;
}

export async function uniswapRouterFixture(
    factoryAddress: string | null = null,
    wrappedAddress: string | null = null,
) {
    if (!factoryAddress) {
        const factory = await uniswapFactoryFixture();

        factoryAddress = factory.address;
    }

    if (!wrappedAddress) {
        const wrapped = await wrappedFixture();

        wrappedAddress = wrapped.address;
    }

    const UniswapV2Router = await ethers.getContractFactory("UniswapV2Router02");
    const router = await UniswapV2Router.deploy(factoryAddress, wrappedAddress);
    await router.deployed();

    return router;
}

export async function gateFixture(routerAddress: string) {
    const Gate = await ethers.getContractFactory('Gate');
    const gate = await upgrades.deployProxy(Gate, [routerAddress]);
    await gate.deployed();

    return gate;
}

export async function stableVaultFixture(gate: Contract) {
    const StableVault = await ethers.getContractFactory('StableVault');
    const stableVaultAddress = await gate.stableVault();

    return StableVault.attach(stableVaultAddress);
}

export async function syntheticVaultFixture(gate: Contract) {
    const SyntheticVault = await ethers.getContractFactory('SyntheticVault');
    const syntheticVaultAddress = await gate.syntheticVault();

    return SyntheticVault.attach(syntheticVaultAddress);
}

export async function syntheticTokenFixture(
    syntheticVault: Contract,
    network: string,
    tokenAddress: string | null,
    symbol: string,
    name: string,
    decimals: number,
) {
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const network_ = ethers.utils.sha256(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(network)));
    const token = tokenAddress ? ethers.utils.sha256(tokenAddress) : ethers.utils.hexZeroPad("0x", 32);

    await syntheticVault.create(network_, token, symbol, name, decimals)
    const syntheticAddress = await syntheticVault.get(network_, token);

    return ERC20Token.attach(syntheticAddress);
}

export async function syntheticTokensFixture(syntheticVault: Contract): Promise<SyntheticTokens> {
    const [_, user1, user2, user3] = await ethers.getSigners();

    const pBTC = await syntheticTokenFixture(
        syntheticVault,  'bitcoin-testnet', null,
        'pBTC', 'Synthetic Bitcoin', 8);

    const pXMR = await syntheticTokenFixture(
        syntheticVault,  'monero-stagenet', null,
        'pXMR', 'Synthetic Monero', 12);

    const token = ethers.utils.hexZeroPad("0x", 32);
    const networkBTC = ethers.utils.sha256(ethers.utils.hexlify(ethers.utils.toUtf8Bytes('bitcoin-testnet')));
    const networkXMR = ethers.utils.sha256(ethers.utils.hexlify(ethers.utils.toUtf8Bytes('monero-stagenet')));

    for (const user of [user1, user2, user3]) {
        await syntheticVault.mint(networkBTC, token, user.address, parseUnits("5", 8));
        await syntheticVault.mint(networkXMR, token, user.address, parseUnits("600", 12));
    }

    return {pBTC, pXMR}
}
