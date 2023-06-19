const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("30")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorAddress, subscriptionId
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorAddress = await vrfCoordinatorV2Mock.address
        const txRes = await vrfCoordinatorV2Mock.createSubscription()
        const txRcpt = await txRes.wait(1)
        subscriptionId = txRcpt.events[0].args.subId
        // Fund Subscription
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    const ENTRANCE_FEE = networkConfig[chainId]["entranceFee"]
    const GAS_LANE = networkConfig[chainId]["gasLane"]
    const CALLBACK_GAS_LIMIT = networkConfig[chainId]["callbackGasLimit"]
    const INTERVAL = networkConfig[chainId]["interval"]

    const args = [
        vrfCoordinatorAddress,
        ENTRANCE_FEE,
        GAS_LANE,
        subscriptionId,
        CALLBACK_GAS_LIMIT,
        INTERVAL,
    ]
    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blocConfirmations || 1,
    })

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lottery.address)
    }

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifing...")
        await verify(lottery.address, args)
    }
    log("----------------------------------------")
}
module.exports.tags = ["all", "lottery"]
