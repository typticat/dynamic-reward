import hre from "hardhat";
import {PORTAL_DATA} from "./config";
import {BigNumber, Contract, ethers} from "ethers";
import {formatUnits, parseUnits} from "ethers/lib/utils";

interface Token {
    token: Contract
    symbol: string
    decimals: number
    balance: string
    is_stablecoin: boolean
}

async function main() {
    const ERC20Token = await hre.ethers.getContractFactory("ERC20Token");
    const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
    const UniswapV2Router = await hre.ethers.getContractFactory("UniswapV2Router02");
    const portalData = PORTAL_DATA[hre.network.name];
    const [sender] = await hre.ethers.getSigners();

    if (!portalData) {
        console.error('Please select network');

        return;
    }

    const router = UniswapV2Router.attach(portalData.router);
    const tokens: Token[] = [];
    const factoryAddress = await router.factory();
    const factory = UniswapV2Factory.attach(factoryAddress);
    let stablecoin: Token | null = null;

    // await hre.run("verify:verify", {
    //     address: '0xD6a7F733E30012CD63e7AceF4731d6A5bdada1A6',
    //     constructorArguments: [
    //         sender.address,
    //     ],
    // });

    console.log('Processing approves:');

    for (const tokenAddress of portalData.tokens) {
        const token = ERC20Token.attach(tokenAddress);
        const symbol = await token.symbol();
        const balance = await token.balanceOf(sender.address);
        const decimals = await token.decimals();
        const is_stablecoin = ['USDC', 'USDT', 'DAI', 'BUSD'].includes(symbol);
        const t = { balance, decimals, symbol, token, is_stablecoin };

        tokens.push(t);

        if (!stablecoin && t.is_stablecoin) {
            stablecoin = t;
        }

        if (symbol == 'USDC') {
            stablecoin = t;
        }

        await token.approve(portalData.router, ethers.constants.MaxUint256);

        console.log(`${symbol} ${formatUnits(balance, decimals)} approved to router`);
    }

    if (!stablecoin) {
        console.error('Stablecoin not found');

        return;
    }

    console.log(`Stablecoin: ${stablecoin.symbol}`)

    for (const token of tokens) {
        if (token.symbol == stablecoin.symbol) continue;

        let stableAmount = parseFloat(formatUnits(stablecoin.balance.toString(), stablecoin.decimals)) * 0.05;
        let tokenAmount = parseFloat(formatUnits(token.balance.toString(), token.decimals)) * 0.05;

        if (token.is_stablecoin) {
            tokenAmount = stableAmount * 0.995;
        }

        const stableAmount_ = parseUnits(stableAmount.toString().slice(0, 2 + token.decimals), stablecoin.decimals);
        const tokenAmount_ = parseUnits(tokenAmount.toString().slice(0, 2 + token.decimals), token.decimals);

        console.warn(`Pair ${stableAmount} ${stablecoin.symbol} - ${tokenAmount} ${token.symbol}`);

        const res = await router.addLiquidity(
            stablecoin.token.address,
            token.token.address,
            stableAmount_,
            tokenAmount_,
            0,
            0,
            sender.address,
            hre.ethers.constants.MaxUint256,
        );

        const r = await res;

        console.log(r.hash);
    }

    const allPairLength = await factory.allPairsLength();

    console.log(`Factory has ${allPairLength} pairs`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
