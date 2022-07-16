import hre, {upgrades} from "hardhat";
import {PORTAL_DATA} from "./config";

async function main() {
    const portalData = PORTAL_DATA[hre.network.name];
    const Gate = await hre.ethers.getContractFactory("Gate");
    const [sender] = await hre.ethers.getSigners();

    if (!portalData) {
        console.error('Please select network');

        return;
    }

    console.log(`Upgrading Gate on ${hre.network.name} by ${sender.address}`);

    const gate = await upgrades.upgradeProxy(portalData.gate, Gate);
    await gate.deployed();

    console.warn(`Gate upgraded: ${gate.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
