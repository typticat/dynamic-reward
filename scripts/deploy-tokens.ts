import hre, {upgrades} from "hardhat";
import {parseUnits} from "ethers/lib/utils";

interface Token {
    symbol: string
    name: string
    decimals: number
    amount: number
}

const USDC = {symbol: 'USDC', decimals: 6, name: 'USD Coin', amount: 15000};
const BUSD = {symbol: 'BUSD', decimals: 18, name: 'Binance USD', amount: 9000};
const DAI = {symbol: 'DAI', decimals: 18, name: 'Dai Stablecoin', amount: 13000};
const USDT = {symbol: 'USDT', decimals: 6, name: 'USD Coin', amount: 10000};
const UNI = {symbol: 'UNI', decimals: 18, name: 'Uniswap', amount: 750};
const LINK = {symbol: 'LINK', decimals: 18, name: 'ChainLink Token', amount: 200};
const CRV = {symbol: 'CRV', decimals: 18, name: 'Curve DAO Token', amount: 800};
const CAKE = {symbol: 'CAKE', decimals: 18, name: 'PancakeSwap Token', amount: 1000};
const WETH = {symbol: 'WETH', decimals: 18, name: 'Wrapped Ether', amount: 4};
const WBTC = {symbol: 'WBTC', decimals: 8, name: 'Wrapped Bitcoin', amount: 3};
const AAVE = {symbol: 'AAVE', decimals: 18, name: 'Aave Token', amount: 50};

const TOKENS: {
    [key: string]: Token[]
} = {
    "rinkeby": [USDC, USDT, UNI, LINK, CRV, AAVE, DAI],
    "smart_chain_testnet": [BUSD, USDC, DAI, LINK, CAKE, WETH],
    "mumbai": [USDC, USDT, WETH, LINK, WBTC, AAVE],
    "avalanche_testnet": [USDC, WETH, WBTC, LINK],
    "optimistic_testnet": [USDT, DAI, USDC, WETH, LINK],
    "arbitrum_testnet": [USDC, WETH, WBTC, LINK, UNI],
    "fantom_testnet": [USDC, DAI, WBTC, LINK],
    "eco_chain_testnet": [DAI, USDT, USDC, LINK, WETH, WBTC],
}

async function main() {
    const ERC20Token = await hre.ethers.getContractFactory("ERC20Token");
    const tokens = TOKENS[hre.network.name] || [];
    const [sender] = await hre.ethers.getSigners();

    if (!tokens.length) {
        console.error('Please select network');

        return;
    }

    console.log(`Deploying tokens on ${hre.network.name} for ${sender.address}`);

    for (const t of tokens) {
        const token = await upgrades.deployProxy(ERC20Token, [t.symbol, t.name, t.decimals]);
        await token.deployed();
        const amount = parseUnits(t.amount.toString(), t.decimals);
        await token.mint(sender.address, amount);

        console.log(`${t.amount} ${t.symbol}: ${token.address}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
