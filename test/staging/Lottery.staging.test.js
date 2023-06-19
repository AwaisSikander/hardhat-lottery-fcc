const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery", function () {
          let lottery, lotteryEntranceFee, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              lottery = await ethers.getContract("Lottery", deployer)
              lotteryEntranceFee = await lottery.getEntracneFee()
          })
          describe("fullfillRandomWords", function () {
              it("works with live chainlink keepers & chainlink Vrf & we get a random number", async function () {
                  const startupTimeStamp = await lottery.getLastTimeStamp()
                  const accounts = await ethers.getSigners()
                  accounts.forEach((ac) => {
                      console.log(ac.address, "in forEach")
                  })
                  // Setup listener before we enter the lottery
                  // Just in case the blockchain moves Really Fast
                  await new Promise(async function (res, rej) {
                      console.log("Entered Promise")

                      lottery.once("WinnerPicked", async () => {
                          console.log("Winner Picked Event Fired!")

                          try {
                              const recentWinner = await lottery.getRecentWinner()
                              const lotteryState = await lottery.getLotteryState()
                              const winnerBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await lottery.getLastTimeStamp()
                              await expect(lottery.getPlayer(0)).to.be.reverted
                              assert.equal(lotteryState, 0)
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(
                                  winnerBalance.toString(),
                                  startingBalance.add(lotteryEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startupTimeStamp)
                              res()
                          } catch (e) {
                              console.log(e)
                              rej(e)
                          }
                      })
                      console.log("Entering Lottery")
                      const startingBalance = await accounts[0].getBalance()

                      await lottery.enterLottery({ value: lotteryEntranceFee })
                  })
                  //   await lottery.enterLottery({ value: lotteryEntranceFee })
              })
          })
      })
