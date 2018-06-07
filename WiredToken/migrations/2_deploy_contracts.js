var WiredToken = artifacts.require("./WiredToken.sol");

module.exports = function(deployer) {
  deployer.deploy(WiredToken);
};

