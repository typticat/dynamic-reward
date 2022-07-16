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

    console.log(`Deploying Gate on ${hre.network.name} by ${sender.address}`);

    // await hre.run("verify:verify", {
    //     address: '0x408d159a5e36f1abb1fc27088faa7d0d03a093c7',
    //     constructorArguments: [],
    // });

    const gate = await upgrades.deployProxy(Gate, [portalData.router]);
    await gate.deployed();

    console.warn(`Gate deployed: ${gate.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
