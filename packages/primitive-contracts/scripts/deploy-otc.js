const bre = require("@nomiclabs/buidler");
const { getContractAt } = bre.ethers;
const { ethers } = require("ethers");
const { AddressZero } = ethers.constants;
const { CONTRACT_NAMES } = require("@primitivefi/contracts/test/lib/constants");
const { OTC_FACTORY } = CONTRACT_NAMES;
const { verifyContract } = require("./lib/utils");
const USDC = require("@primitivefi/contracts/deployments/rinkeby/USDC.json");
const Registry = require("@primitivefi/contracts/deployments/rinkeby/Registry.json");
const OtcFactory = require("@primitivefi/contracts/deployments/rinkeby/OtcFactory");

const verifyOtcFactory = async () => {
    try {
        await verifyContract(
            OTC_FACTORY,
            OtcFactory.address,
            OtcFactory.args,
            {}
        );
    } catch (err) {
        console.error(err);
    }
};

async function main() {
    bre.deployments.run(["Otc"]);
    let Registry = await deployments.get("Registry");
    let USDC = await deployments.get("USDC");
    let otcFactory = await deployments.get("OtcFactory");
    otcFactory = await getContractAt(otcFactory.abi, otcFactory.address);
    if ((await otcFactory.registry()) == AddressZero) {
        await otcFactory.setRegistry(Registry.address);
    }
    if ((await otcFactory.quoteToken()) == AddressZero) {
        await otcFactory.setQuoteToken(USDC.address);
    }
    await verifyOtcFactory();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
