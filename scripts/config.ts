interface Network {
    router: string,
    gate: string,
    tokens: string[],
}

export const PORTAL_DATA: {
    [key: string]: Network
} = {
    "rinkeby": {
        router: '0x05A2404EbA8cbEfBc9D3E7d8b8f639803EB14b9E',
        gate: '0x26E4Ad825A63996F84AD16DFc355A56D29BDA8Df',
        tokens: [
            '0x63f6032CF85D259a1A588B271FcABcd98A9df814',
            '0x8DBEC2EA0D6bCb832720b2f0494321a11B11b495',
            '0x66eB07a07ACe926F3956079B8Fd9DCC259aF7EDE',
            '0xF05Cba0E2058e07aE3602fFcCe617f69d7cA1E09',
            '0xBa949f49F02Ba36d53FD34b601618a6885AF553f',
            '0x5095F3b5806c25FEfD9676aA41Af63e325b690EC',
            '0x6C3a3A6060eEC49907e70A49778924cA4730713d',
        ],
    },
    "smart_chain_testnet": {
        router: '0x7DFB6a696C9e9bd561DC9dd5594F5136c50FA385',
        gate: '0x84dA116faAD75d4D43A5bA0EF5BF672a5d043094',
        tokens: [
            '0xB666f89FE84B8Fa45e78c5447770392976C93BE5',
            '0x06AFa39446A55655cfC53a6143BE25701F223a5c',
            '0x99324D515d6CD7dc1a01c50A9e0c9ee3F5702973',
            '0x9166624C176134ba70Cc1B1768cD41f72AAb8e06',
            '0xF419eCc47DbB6082Ce970a0AB5c613EEf72cCFa2',
            '0x7107fbEa46ADc293F6497D67FEF867294D1cd80c',
        ],
    },
    "mumbai": {
        router: '0xACF0Aa14Af21B68a2E1200454233a16e2CbE9a53',
        gate: '0xfBB092Ca4E4798D13dE56d1A7d12cf52B1439e4A',
        tokens: [
            '0x99324D515d6CD7dc1a01c50A9e0c9ee3F5702973',
            '0x32EC5B292E73c980A5BF13044C0cc2ABBEc4cb9e',
            '0xb6F5EA8eA8229D0AD7b7b7490FC71f9c5e1768c3',
            '0x06AFa39446A55655cfC53a6143BE25701F223a5c',
            '0xb65ac6DaA337c9Ac2299f82d1e4129f13af018a8',
            '0x335762A2220773637DF9AcB4Eb1E391806a738F6',
        ],
    },
    "avalanche_testnet": {
        router: '0xA52F8aCBf6c60078715D2B870647C256ad2A08D4',
        gate: '0x1d9643c4f62a2A0C2664eCc0b9Fb47448Ff19b03',
        tokens: [
            '0x32EC5B292E73c980A5BF13044C0cc2ABBEc4cb9e',
            '0xb65ac6DaA337c9Ac2299f82d1e4129f13af018a8',
            '0x99324D515d6CD7dc1a01c50A9e0c9ee3F5702973',
            '0x06AFa39446A55655cfC53a6143BE25701F223a5c',
        ],
    },
    "optimistic_testnet": {
        router: '0x89769893b2964734fF87B4cC1A1155B886393A63',
        gate: '0x0EE71d7c0E64f69AA2262F85f9e3F45D1CA586eD',
        tokens: [
            '0x476448c6dAf597aAe09e3cE8f307F03EA799040c',
            '0xb6F5EA8eA8229D0AD7b7b7490FC71f9c5e1768c3',
            '0x32EC5B292E73c980A5BF13044C0cc2ABBEc4cb9e',
            '0xb65ac6DaA337c9Ac2299f82d1e4129f13af018a8',
            '0x06AFa39446A55655cfC53a6143BE25701F223a5c',
        ],
    },
    "arbitrum_testnet": {
        router: '0x99324D515d6CD7dc1a01c50A9e0c9ee3F5702973',
        gate: '0x1bD84e6011Bdf6c118810B45537F0c1f25FE78c9',
        tokens: [
            '0xEF26C5Ff435c1fD4E60fe1A9F717EDd89115dC4F',
            '0xB32C6f9Ae23d30c39AA063ab7f6571CE16698787',
            '0xf80F9aaea3Fa8ba8242e8e3CfcB7e6B52A2976C4',
            '0x9643614c09319e661e64fd527fE699Fc327001f5',
            '0xE1a7033383fDD4B55c8237629D62c0d4f3DA6B67',
        ],
    },
    "fantom_testnet": {
        router: '0xb65ac6DaA337c9Ac2299f82d1e4129f13af018a8',
        gate: '0x7DFB6a696C9e9bd561DC9dd5594F5136c50FA385',
        tokens: [
            '0xEF26C5Ff435c1fD4E60fe1A9F717EDd89115dC4F',
            '0xf80F9aaea3Fa8ba8242e8e3CfcB7e6B52A2976C4',
            '0x9643614c09319e661e64fd527fE699Fc327001f5',
            '0x5853b29f0197265aeA8Aba820D2122aCc0A45aC8',
        ],
    },
    "eco_chain_testnet": {
        router: '0x8583F1275109ED7f99FA1667c32C068FCdF9B807',
        gate: '0xDf70081941d137ff2DF29E9bBd2ee89873183216',
        tokens: [
            '0x7107fbEa46ADc293F6497D67FEF867294D1cd80c',
            '0xEF26C5Ff435c1fD4E60fe1A9F717EDd89115dC4F',
            '0xB32C6f9Ae23d30c39AA063ab7f6571CE16698787',
            '0x9643614c09319e661e64fd527fE699Fc327001f5',
            '0xE1a7033383fDD4B55c8237629D62c0d4f3DA6B67',
            '0x5853b29f0197265aeA8Aba820D2122aCc0A45aC8',
        ],
    },
}
