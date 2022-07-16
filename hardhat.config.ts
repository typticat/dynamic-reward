import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-dependency-compiler";
import "@nomiclabs/hardhat-etherscan";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    dependencyCompiler: {
        paths: [
            "@uniswap/v2-core/contracts/UniswapV2Factory.sol",
            "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol",
            "@uniswap/lib/contracts/libraries/TransferHelper.sol",
        ],
    },
    solidity: {
        compilers: [
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 2000,
                    },
                },
            },
            {
                version: "0.8.2",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 2000,
                    },
                },
            },
            {
                version: "0.5.16",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 2000,
                    },
                },
            },
            {
                version: "0.6.6",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 2000,
                    },
                },
            }
        ]
    },
    etherscan: {
        apiKey: {
            rinkeby: 'RINKEBY_API_KEY',
            optimisticKovan: 'OPTIMISTIC_API_KEY',
        },
    },
    networks: {
        rinkeby: {
            url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 2100000,
            gasPrice: 8000000000,
            gasLimit: 9999999,
        },
        smart_chain_testnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 2100000,
            gasPrice: 25000000000,
            gasLimit: 9999999,
        },
        mumbai: {
            url: "https://matic-mumbai.chainstacklabs.com", // https://rpc-mumbai.maticvigil.com
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 2100000,
            gasPrice: 8000000000,
            gasLimit: 9999999,
        },
        avalanche_testnet: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 8000000,
            gasPrice: 25000000000,
            gasLimit: 8000000,
        },
        optimistic_testnet: {
            url: "https://kovan.optimism.io",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 8100000,
            gasPrice: 8000000000,
            gasLimit: 99999999,
        },
        arbitrum_testnet: {
            url: "https://rinkeby.arbitrum.io/rpc",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 8100000,
            gasPrice: 8000000000,
        },
        fantom_testnet: {
            url: "https://rpc.testnet.fantom.network/",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 8100000,
            gasPrice: 250000000000,
        },
        eco_chain_testnet: {
            url: "https://http-testnet.hecochain.com",
            accounts: ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
            gas: 8100000,
            gasPrice: 25000000000,
        },
    }
};
