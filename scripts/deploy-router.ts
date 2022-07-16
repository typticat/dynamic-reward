import hre from "hardhat";

const WETH: {
    [key: string]: string
} = {
    "rinkeby": "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    "smart_chain_testnet": "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    "mumbai": "0x9c3c9283d3e44854697cd22d3faa240cfb032889",
    "avalanche_testnet": "0x1D308089a2D1Ced3f1Ce36B1FcaF815b07217be3",
    "optimistic_testnet": "0x4200000000000000000000000000000000000006",
    "arbitrum_testnet": "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
    "fantom_testnet": "0xfEd7f074cBd371f97b07eeE9bADf76A7019af0b3",
    "eco_chain_testnet": "0x5bD54469d40a0F55a43b7D9123071f48fFb9F3Bd",
}

async function main() {
    const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
    const UniswapV2Router = await hre.ethers.getContractFactory("UniswapV2Router02");
    const [sender] = await hre.ethers.getSigners();
    const weth = WETH[hre.network.name];

    if (!weth) {
        console.error("Select network");

        return;
    }

    const factory = await UniswapV2Factory.deploy(sender.address);
    await factory.deployed();

    const router = await UniswapV2Router.deploy(factory.address, weth);
    await router.deployed();

    console.log("UniswapV2Factory deployed to:", factory.address);
    console.log("WETH:", weth);
    console.log("UniswapV2Router deployed to:", router.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
