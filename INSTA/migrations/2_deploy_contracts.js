const InstaToken = artifacts.require("./InstaToken.sol");
const InstaPresale = artifacts.require("./InstaPresale.sol");
//const MultisigWallet = artifacts.require('MultiSigWallet.sol')

module.exports = function(deployer) {
  deployer.deploy(InstaToken).then(function() {
    return deployer.deploy(InstaPresale, InstaToken.address, InstaToken.address);
  });

  //deployer.deploy(MultisigWallet, [InstaToken.address, InstaToken.address], 2);
}