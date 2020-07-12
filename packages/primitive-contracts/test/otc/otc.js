const { ethers } = require("@nomiclabs/buidler");
const { expect } = require("chai");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const utils = require("../lib/utils");
const setup = require("../lib/setup");
const constants = require("../lib/constants");
const { parse } = require("ethers/utils/transaction");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { formatUnits } = require("ethers/utils");
const { newERC20, newWallets, newOtc, newOtcOption } = setup;
const { THOUSAND_ETHER, MILLION_ETHER } = constants.VALUES;

describe("OTC option test", () => {
    // ACCOUNTS
    let signers, Admin, User, Alice, Bob;
    let otc, otcFactory, optionToken;
    let underlyingToken, quoteToken, strikeToken;
    let base, quote, expiry, bid, ask, size;

    before(async () => {
        signers = await newWallets();
        Admin = signers[0];
        User = signers[1];
        Alice = Admin._address;
        Bob = User._address;

        underlyingToken = await newERC20(Admin, "Ether", "ETH", THOUSAND_ETHER);
        quoteToken = await newERC20(Admin, "USD Coin", "USDC", THOUSAND_ETHER);
        strikeToken = quoteToken;
        otcFactory = await newOtc(Admin, underlyingToken, quoteToken);
        base = parseEther("200");
        quote = parseEther("1");
        expiry = "1690868800"; // May 30, 2020, 8PM UTC
        bid = parseEther("1");
        ask = parseEther("1");
        size = 1000;
    });

    describe("sellOtc", () => {
        it("should open a new sell otc order", async () => {
            await underlyingToken.approve(otcFactory.address, MILLION_ETHER);
            await otcFactory.sellOtc(
                underlyingToken.address,
                strikeToken.address,
                base,
                quote,
                expiry,
                ask,
                size
            );
            otc = await newOtcOption(Admin, await otcFactory.otc());
            expect(await otc.sellFilled()).to.be.eq(true);
            optionToken = await ethers.getContractAt(
                "Option",
                await otc.option(),
                Admin
            );
            console.log(optionToken);
        });

        it("should fill the buy side of the otc", async () => {
            await quoteToken.connect(User).approve(otc.address, MILLION_ETHER);
            await expect(otc.connect(User).buy()).to.emit(otc, "Buy");
            console.log(await otc.sellFilled(), await otc.buyFilled());

            const optionBuyBalance = await optionToken.balanceOf(Bob);
            const quoteSellBalance = await quoteToken.balanceOf(Alice);
            console.log(
                formatEther(optionBuyBalance),
                formatEther(quoteSellBalance)
            );
        });
    });
});
