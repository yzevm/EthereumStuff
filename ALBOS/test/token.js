const AlbosToken = artifacts.require("./AlbosToken.sol");
const utils = require('./helpers/Utils');

contract('AlbosToken', function(accounts) {

  it('verifies the token name after construction', async () => {
    let token = await AlbosToken.new();
    let name = await token.name.call();
    assert.equal(name, 'ALBOS Token');
  });

  it('verifies the token symbol after construction', async () => {
    let token = await AlbosToken.new();
    let symbol = await token.symbol.call();
    assert.equal(symbol, 'ALB');
  });

  it('verifies the balance and supply', async () => {
    let token = await AlbosToken.new();
    let balance = await token.balanceOf.call(token.address);
    assert.equal(balance, 28710000000000000000000000000);
    let supply = await token.totalSupply.call();
    assert.equal(supply, 28710000000000000000000000000);
  });

  it('verifies the balances after a transfer', async () => {
    let token = await AlbosToken.new();
    await token.startListing();
    await token.addPrivateSaleTokens(accounts[0], 28710000000000000000000000000);
    balanceOwner = await token.balanceOf.call(token.address);
    assert.equal(balanceOwner.toNumber(), 0);
    await token.transfer(accounts[1], 28710000000000000000000000000);
    let balance;
    balance = await token.balanceOf.call(accounts[1]);
    assert.equal(balance.toNumber(), 28710000000000000000000000000);
  });

  it('should allow when attempting to transfer to the new wallet', async () => {
    let token = await AlbosToken.new();

    try {
      await token.transfer(token.address, 10);
      assert(true, "allow");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the allowance after an approval', async () => {
    let token = await AlbosToken.new();
    await token.approve(accounts[1], 500);
    let allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 500);
  });

  it('verifies that an approval fires an Approval event', async () => {
    let token = await AlbosToken.new();
    await token.addPrivateSaleTokens(accounts[0], 500);
    let res = await token.approve(accounts[1], 500);
    assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
  });

  it('should throw when attempting to define transfer for an invalid address', async () => {
    let token = await AlbosToken.new();

    try {
        await token.transfer(utils.zeroAddress, 10);
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that transferring from another account fires a Transfer event', async () => {
    let token = await AlbosToken.new();
    await token.startListing();
    await token.addPrivateSaleTokens(accounts[0], 50000000000);
    await token.approve(accounts[1], 50000000000);
    let res = await token.transferFrom(accounts[0], accounts[2], 50000000000, { from: accounts[1] });
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies the new allowance after transferring from another account', async () => {
    let token = await AlbosToken.new();
    await token.startListing();
    await token.addPrivateSaleTokens(accounts[0], 50000000000);
    await token.approve(accounts[1], 50000000000);
    await token.transferFrom(accounts[0], accounts[2], 5000000000, { from: accounts[1] });
    let allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 45000000000);
  });

  it('should throw when attempting to transfer from another account more than the allowance', async () => {
    let token = await AlbosToken.new();
    await token.approve(accounts[1], 100);

    try {
        await token.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('should throw when attempting to transfer from an invalid account', async () => {
    let token = await AlbosToken.new();
    await token.approve(accounts[1], 100);

    try {
        await token.transferFrom(utils.zeroAddress, accounts[2], 50, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('should throw when attempting to transfer from to an invalid account', async () => {
    let token = await AlbosToken.new();
    await token.approve(accounts[1], 100);

    try {
        await token.transferFrom(accounts[0], utils.zeroAddress, 50, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the owner after construction', async () => {
    let contract = await AlbosToken.new();
    let owner = await contract.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it('verifies the new owner after ownership transfer', async () => {
    let contract = await AlbosToken.new();
    await contract.transferOwnership(accounts[1]);
    let owner = await contract.owner.call();
    assert.equal(owner, accounts[1]);
  });

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    let contract = await AlbosToken.new();
    let res = await contract.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  });

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    let contract = await AlbosToken.new();
    await contract.renounceOwnership();
    let owner = await contract.owner.call();
    assert.equal(owner, utils.zeroAddress);
  });

  it('verifies that only the owner can initiate ownership transfer', async () => {
    let contract = await AlbosToken.new();

    try {
        await contract.transferOwnership(accounts[1], { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the balance and supply after burning', async () => {
    let token = await AlbosToken.new();
    await token.startListing();
    await token.addPrivateSaleTokens(accounts[0], 28710000000000000000000000000);
    let balance = await token.balanceOf.call(accounts[0]);
    assert.equal(balance.toNumber(), 28710000000000000000000000000);
    await token.burn(28710000000000000000000000000);
    let newBalance = await token.balanceOf.call(accounts[0]);
    assert.equal(newBalance.toNumber(), 0);
    let supply = await token.totalSupply.call();
    assert.equal(supply.toNumber(), 0);
  });

  it('verifies that array processing works correctly to addPrivateSale Airdrop Multi', async () => {
    let contract = await AlbosToken.new();
    await contract.addPrivateSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    let airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    let airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    let airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addPrivateSale', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addPrivateSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addPrivateSale Airdrop Multi accounts fires an Transfer event', async () => {
    let contract = await AlbosToken.new();
    let res = await contract.addPrivateSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addPrivateSaleTokens works correctly', async () => {
    let contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addPrivateSaleTokens(accounts[1], 1234);

    let isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    await contract.transfer(accounts[4], 1234, { from: accounts[1] });
  });

  it('verifies that only the owner can initiate addPrivateSaleTokens', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addPrivateSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the new agent after setNewAgent', async () => {
    let contract = await AlbosToken.new();
    let agent = await contract.agentAddress.call();
    assert.equal(agent, accounts[0]);
    await contract.transferAgent(accounts[1]);
    let newAgent = await contract.agentAddress.call();
    assert.equal(newAgent, accounts[1]);
  });

  it('verifies that only the owner can initiate setNewAgent', async () => {
    let contract = await AlbosToken.new();

    try {
        await contract.transferAgent(accounts[1], { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addPreSaleTokensMulti Airdrop Multi', async () => {
    let contract = await AlbosToken.new();
    await contract.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    let airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    let airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    let airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    let airdropFisrt2 = await contract.preSaleTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    let airdropSecond2 = await contract.preSaleTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    let airdropThird2 = await contract.preSaleTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addPreSaleTokensMulti', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addPreSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addPreSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    let contract = await AlbosToken.new();
    let res = await contract.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addPreSaleTokens works correctly', async () => {
    let contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addPreSaleTokens(accounts[1], 1234);

    let isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    let preSaleTokens = await contract.preSaleTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1234);
  });

  it('verifies that only the owner can initiate addPreSaleTokens', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addPreSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addCrowdSaleTokensMulti Airdrop Multi', async () => {
    let contract = await AlbosToken.new();
    await contract.addCrowdSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    let airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    let airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    let airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    let airdropFisrt2 = await contract.crowdSaleTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    let airdropSecond2 = await contract.crowdSaleTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    let airdropThird2 = await contract.crowdSaleTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addCrowdSaleTokensMulti', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addCrowdSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addCrowdSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    let contract = await AlbosToken.new();
    let res = await contract.addCrowdSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addCrowdSaleTokens works correctly', async () => {
    let contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addCrowdSaleTokens(accounts[1], 1234);

    let isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    let preSaleTokens = await contract.crowdSaleTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1234);
  });

  it('verifies that only the owner can initiate addCrowdSaleTokens', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addCrowdSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });


  it('verifies that array processing works correctly to addFrostTokensMulti Airdrop Multi', async () => {
    let contract = await AlbosToken.new();
    await contract.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);
    await contract.addFrostTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000], [111, 11, 1]);

    let airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    let airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    let airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    let airdropFisrt2 = await contract.freezeTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    let airdropSecond2 = await contract.freezeTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    let airdropThird2 = await contract.freezeTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);

    let airdropFisrt23 = await contract.freezeTimeBlock.call(accounts[1]);
    assert.equal(airdropFisrt23.toNumber(), 111);
    let airdropSecond23 = await contract.freezeTimeBlock.call(accounts[2]);
    assert.equal(airdropSecond23.toNumber(), 11);
    let airdropThird23 = await contract.freezeTimeBlock.call(accounts[3]);
    assert.equal(airdropThird23.toNumber(), 1);
  });

  it('verifies that only the owner can initiate addFrostTokensMulti', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addFrostTokensMulti([accounts[1]], [6000000], [123], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addFrostTokens works correctly', async () => {
    let contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addPrivateSaleTokens(accounts[1], 1234);
    await contract.addFrostTokens(accounts[1], 1234, 4321);

    let isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    let preSaleTokens = await contract.freezeTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1234);

    let preSaleTokens1 = await contract.freezeTimeBlock.call(accounts[1]);
    assert.equal(preSaleTokens1.toNumber(), 4321);
  });

  it('verifies that only the owner can initiate addFrostTokens', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.addFrostTokens([accounts[1]], 6000000, 4321, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that startListing works correctly', async () => {
    let contract = await AlbosToken.new();
    await contract.startListing();

    let preSaleTokens1 = await contract.listing.call();
    assert.equal(preSaleTokens1, true);
  });

  it('verifies that only the owner can initiate startListing', async () => {
    let contract = await AlbosToken.new();

    try {
      await contract.startListing({ from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

});





