const AlbosToken = artifacts.require("./AlbosToken.sol");
const Founders = artifacts.require("./Founders.sol");
const Reserved = artifacts.require("./Reserved.sol");

let albosInstance;
let foundersInstance;
let reservedInstance;
const teamWallet = '0x0000000000000000000000000000000000000001'

module.exports = function(deployer) {
  deployer.deploy(AlbosToken).then(function(_albosInstance) {
    albosInstance = _albosInstance;
    return deployer.deploy(Founders, albosInstance.address, teamWallet);
  }).then(function(_foundersInstance) {
    foundersInstance = _foundersInstance;
    return deployer.deploy(Reserved, albosInstance.address, teamWallet);
  }).then(function(_reservedInstance) {
    reservedInstance = _reservedInstance;
    albosInstance.setFoundersContract(foundersInstance.address)
    albosInstance.setReservedContract(reservedInstance.address)
  })
};
