const AlbosToken = artifacts.require("./AlbosToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AlbosToken);
};