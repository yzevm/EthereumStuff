const Lottery = artifacts.require('./Lottery.sol')

module.exports = async function(deployer) {
  deployer.deploy(Lottery)
}
