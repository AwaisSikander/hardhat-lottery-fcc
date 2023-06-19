const { run } = require("hardhat")
async function verify(contractAddress, args) {
    console.log("verifing address......")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.massage.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.error(e)
        }
    }
}

module.exports = { verify }
