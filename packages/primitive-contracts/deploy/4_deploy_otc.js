// We require the Buidler Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
const bre = require("@nomiclabs/buidler");
const { getContractAt } = bre.ethers;
const Weth = require("canonical-weth");
const ETH = require("@primitivefi/contracts/deployments/rinkeby/ETH.json");
const USDC = require("@primitivefi/contracts/deployments/rinkeby/USDC.json");
const Registry = require("@primitivefi/contracts/deployments/rinkeby/Registry.json");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log, deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const chain = await bre.getChainId();
    let otcFactory;
    if (chain == "4") {
        otcFactory = await deploy("OtcFactory", {
            from: deployer,
            contractName: "OtcFactory",
            args: [],
        });

        otcFactory = await deployments.get("OtcFactory");
        otcFactory = await getContractAt(otcFactory.abi, otcFactory.address);
        await otcFactory.setRegistry(Registry.address);
        await otcFactory.setQuoteToken(USDC.address);
    }

    let deployed = [otcFactory];
    for (let i = 0; i < deployed.length; i++) {
        if (deployed[i].newlyDeployed)
            log(
                `Contract deployed at ${deployed[i].address} using ${deployed[i].receipt.gasUsed} gas on chain ${chain}`
            );
    }
};

module.exports.tags = ["Otc"];
