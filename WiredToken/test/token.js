const WiredToken = artifacts.require("./WiredToken.sol");
const utils = require('./helpers/Utils');

contract('WiredToken', function(accounts) {

  // it('verifies the token name after construction', async () => {
  //   let token = await WiredToken.new();
  //   let name = await token.name.call();
  //   assert.equal(name, 'Wired Token');
  // });

  // it('verifies the token symbol after construction', async () => {
  //   let token = await WiredToken.new();
  //   let symbol = await token.symbol.call();
  //   assert.equal(symbol, 'WRD');
  // });

  // it('verifies the balance and supply', async () => {
  //   let token = await WiredToken.new();
  //   let balance = await token.balanceOf.call(token.address);
  //   assert.equal(balance, 410000000000000000000);
  //   let supply = await token.totalSupply.call();
  //   assert.equal(supply, 410000000000000000000);
  // });

  // it('verifies the balances after a transfer', async () => {
  //   let token = await WiredToken.new();
  //   await token.transferTokens(100000000000);
  //   let balance;
  //   balance = await token.balanceOf.call(token.address);
  //   assert.equal(balance.toNumber(), 400000000000000000000);
  //   balance = await token.balanceOf.call(accounts[0]);
  //   assert.equal(balance.toNumber(), 10000000000000000000);
  // });

  // it('should allow when attempting to transfer to the new wallet', async () => {
  //   let token = await WiredToken.new();

  //   try {
  //     await token.transfer(token.address, 10);
  //     assert(true, "allow");
  //   }
  //   catch (error) {
  //     return utils.ensureException(error);
  //   }
  // });

  // it('verifies the allowance after an approval', async () => {
  //   let token = await WiredToken.new();
  //   await token.approve(accounts[1], 500);
  //   let allowance = await token.allowance.call(accounts[0], accounts[1]);
  //   assert.equal(allowance, 500);
  // });

  // it('verifies that an approval fires an Approval event', async () => {
  //   let token = await WiredToken.new();
  //   let res = await token.approve(accounts[1], 500);
  //   assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
  // });

  // it('should throw when attempting to define transfer for an invalid address', async () => {
  //   let token = await WiredToken.new();

  //   try {
  //       await token.transfer(utils.zeroAddress, 10);
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies that transferring from another account fires a Transfer event', async () => {
  //   let token = await WiredToken.new();
  //   await token.transferTokens(500);
  //   await token.approve(accounts[1], 50000000000);
  //   let res = await token.transferFrom(accounts[0], accounts[2], 5000, { from: accounts[1] });
  //   assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  // });

  // it('verifies the new allowance after transferring from another account', async () => {
  //   let token = await WiredToken.new();
  //   await token.transferTokens(500);
  //   await token.approve(accounts[1], 50000000000);
  //   await token.transferFrom(accounts[0], accounts[2], 5000000000, { from: accounts[1] });
  //   let allowance = await token.allowance.call(accounts[0], accounts[1]);
  //   assert.equal(allowance, 45000000000);
  // });

  // it('should throw when attempting to transfer from another account more than the allowance', async () => {
  //   let token = await WiredToken.new();
  //   await token.approve(accounts[1], 100);

  //   try {
  //       await token.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('should throw when attempting to transfer from an invalid account', async () => {
  //   let token = await WiredToken.new();
  //   await token.approve(accounts[1], 100);

  //   try {
  //       await token.transferFrom(utils.zeroAddress, accounts[2], 50, { from: accounts[1] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('should throw when attempting to transfer from to an invalid account', async () => {
  //   let token = await WiredToken.new();
  //   await token.approve(accounts[1], 100);

  //   try {
  //       await token.transferFrom(accounts[0], utils.zeroAddress, 50, { from: accounts[1] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies the owner after construction', async () => {
  //   let contract = await WiredToken.new();
  //   let owner = await contract.owner.call();
  //   assert.equal(owner, accounts[0]);
  // });

  // it('verifies the new owner after ownership transfer', async () => {
  //   let contract = await WiredToken.new();
  //   await contract.transferOwnership(accounts[1]);
  //   let owner = await contract.owner.call();
  //   assert.equal(owner, accounts[1]);
  // });

  // it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
  //   let contract = await WiredToken.new();
  //   let res = await contract.transferOwnership(accounts[1]);
  //   assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  // });

  // it('verifies that newOwner is cleared after ownership transfer', async () => {
  //   let contract = await WiredToken.new();
  //   await contract.renounceOwnership();
  //   let owner = await contract.owner.call();
  //   assert.equal(owner, utils.zeroAddress);
  // });

  // it('verifies that only the owner can initiate ownership transfer', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.transferOwnership(accounts[1], { from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies the balance and supply after burning', async () => {
  //   let token = await WiredToken.new();
  //   await token.transferTokens(4100000000000);
  //   let balance = await token.balanceOf.call(accounts[0]);
  //   assert.equal(balance.toNumber(), 410000000000000000000);
  //   await token.burn(410000000000000000000);
  //   let newBalance = await token.balanceOf.call(accounts[0]);
  //   assert.equal(newBalance.toNumber(), 0);
  //   let supply = await token.totalSupply.call();
  //   assert.equal(supply.toNumber(), 0);
  // });

  // it('verifies the balance and supply after minting', async () => {
  //   let token = await WiredToken.new();
  //   let balance = await token.balanceOf.call(token.address);
  //   assert.equal(balance.toNumber(), 410000000000000000000);
  //   await token.mint(accounts[1], 410000000000000000000);
  //   let newBalance = await token.balanceOf.call(accounts[1]);
  //   assert.equal(newBalance.toNumber(), 410000000000000000000);
  //   let supply = await token.totalSupply.call();
  //   assert.equal(supply.toNumber(), 820000000000000000000);
  // });

  // it('should allow when attempting to mint by not owner', async () => {
  //   let token = await WiredToken.new();

  //   try {
  //     await token.mint(accounts[1], 10, { from: accounts[1] });
  //     assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //     return utils.ensureException(error);
  //   }
  // });

  // it('verifies that array processing works correctly to distribute Airdrop Multi', async () => {
  //   let contract = await WiredToken.new();
  //   await contract.distributeAirdropMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

  //   let airdropFisrt = await contract.balanceOf.call(accounts[1]);
  //   assert.equal(airdropFisrt.toNumber(), 4000e8);
  //   let airdropSecond = await contract.balanceOf.call(accounts[2]);
  //   assert.equal(airdropSecond.toNumber(), 1e8);
  //   let airdropThird = await contract.balanceOf.call(accounts[3]);
  //   assert.equal(airdropThird.toNumber(), 6000e8);
  // });

  // it('verifies that only the owner can initiate distributeAirdropMulti', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //     await contract.distributeAirdropMulti([accounts[1]], [6000000], { from: accounts[1] });
  //     assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //     return utils.ensureException(error);
  //   }
  // });

  // it('verifies that distribute Airdrop Multi accounts fires an Transfer event', async () => {
  //   let contract = await WiredToken.new();
  //   let res = await contract.distributeAirdropMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
  //   assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  // });

  // it('verifies that distribute Airdrop works correctly', async () => {
  //   let contract = await WiredToken.new();
  //   await contract.distributeAirdrop([accounts[1]], 1234);

  //   let isLockedFirst = await contract.balanceOf.call(accounts[1]);
  //   assert.equal(isLockedFirst.toNumber(), 1234e8);

  //   await contract.transfer(accounts[4], 1234e8, { from: accounts[1] });
  // });

  // it('verifies that array processing works correctly to distribute Airdrop', async () => {
  //   let contract = await WiredToken.new();
  //   await contract.distributeAirdrop([accounts[1], accounts[2], accounts[3]], 6000);

  //   let airdropFisrt = await contract.balanceOf.call(accounts[1]);
  //   assert.equal(airdropFisrt.toNumber(), 6000e8);
  //   let airdropSecond = await contract.balanceOf.call(accounts[2]);
  //   assert.equal(airdropSecond.toNumber(), 6000e8);
  //   let airdropThird = await contract.balanceOf.call(accounts[3]);
  //   assert.equal(airdropThird.toNumber(), 6000e8);
  // });

  // it('verifies that only the owner can initiate distributeAirdrop', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //     await contract.distributeAirdrop([accounts[1]], 6000000, { from: accounts[1] });
  //     assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //     return utils.ensureException(error);
  //   }
  // });

  // it('verifies that distribute Airdrop Multi accounts fires an Transfer event', async () => {
  //   let contract = await WiredToken.new();
  //   let res = await contract.distributeAirdrop([accounts[1], accounts[2], accounts[3]], 6000000);
  //   assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  // });

  // it('verifies the new agent after setNewAgent', async () => {
  //   let contract = await WiredToken.new();
  //   let agent = await contract.agent.call();
  //   assert.equal(agent, accounts[0]);
  //   await contract.setNewAgent(accounts[1]);
  //   let newAgent = await contract.agent.call();
  //   assert.equal(newAgent, accounts[1]);
  // });

  // it('verifies that only the owner can initiate setNewAgent', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.setNewAgent(accounts[1], { from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies the new distributeAmount after set distribute amount by owner', async () => {
  //   let contract = await WiredToken.new();
  //   let amount = await contract.distributeAmount.call();
  //   assert.equal(amount.toNumber(), 41000000000000000000);
  //   await contract.setDistributeAmount(100);
  //   let newAmount = await contract.distributeAmount.call();
  //   assert.equal(newAmount.toNumber(), 100);
  // });

  // it('verifies that only the owner can initiate set distribute amount', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.setDistributeAmount(100, { from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies the new mulbonus after setMulBonus', async () => {
  //   let contract = await WiredToken.new();
  //   let bonus = await contract.mulbonus.call();
  //   assert.equal(bonus, 1000);
  //   await contract.setMulBonus(10);
  //   let newBonus = await contract.mulbonus.call();
  //   assert.equal(newBonus, 10);
  // });

  // it('verifies that only the owner can initiate set Mul Bonus', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.setMulBonus(10, { from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies the new divbonus after setDivBonus', async () => {
  //   let contract = await WiredToken.new();
  //   let bonus = await contract.divbonus.call();
  //   assert.equal(bonus, 10000000000);
  //   await contract.setDivBonus(10);
  //   let newBonus = await contract.divbonus.call();
  //   assert.equal(newBonus, 10);
  // });

  // it('verifies that only the owner can initiate setDivBonus', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.setDivBonus(10, { from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });

  // it('verifies the transfer ethers from contract works correctly', async () => {
  //   let contract = await WiredToken.new();

  //   await contract.setDistributeAmount(1000000000000);

  //   await web3.eth.sendTransaction({
  //     from: accounts[0],
  //     to: contract.address,
  //     gas: 200000,
  //     value: web3.toWei(1, "ether")
  //   });

  //   let contractBalance = await web3.eth.getBalance(contract.address);
  //   assert.equal(contractBalance.toNumber(), 1000000000000000000);

  //   let senderBalance = await web3.eth.getBalance(accounts[0]);

  //   await contract.transferFund();

  //   let newContractBalance = await web3.eth.getBalance(contract.address);
  //   assert.equal(newContractBalance.toNumber(), 0);

  //   let newSenderBalance = await web3.eth.getBalance(accounts[0]);
  //   assert.equal(newSenderBalance.toNumber() > contractBalance.toNumber(), true);
  // });

  // it('verifies that only the owner can initiate ethers transfer', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.transferFund({ from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });
  
  // it('verifies the transfer tokens from contract works correctly', async () => {
  //   let contract = await WiredToken.new();
  //   let firstBalance = await contract.balanceOf.call(contract.address);
  //   assert.equal(firstBalance.toNumber(), 410000000000000000000);

  //   await contract.transferTokens(4100000000000);

  //   let secondBalance = await contract.balanceOf.call(contract.address);
  //   assert.equal(secondBalance.toNumber(), 0);

  //   let ownerBalance = await contract.balanceOf.call(accounts[0]);
  //   assert.equal(ownerBalance.toNumber(), 410000000000000000000);
  // });

  // it('verifies that only the owner can initiate transfer tokens', async () => {
  //   let contract = await WiredToken.new();

  //   try {
  //       await contract.transferTokens(410000000000, { from: accounts[2] });
  //       assert(false, "didn't throw");
  //   }
  //   catch (error) {
  //       return utils.ensureException(error);
  //   }
  // });




});