const TokenData = artifacts.require("./TokenData.sol")
module.exports = deployer => deployer.deploy(TokenData, '0x3e9af6f2fd0c1a8ec07953e6bc0d327b5aa867b8', {gas: 8000000})
