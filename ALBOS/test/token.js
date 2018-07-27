const AlbosToken = artifacts.require("./AlbosToken.sol");
const Founders = artifacts.require("./Founders.sol");
const Reserved = artifacts.require("./Reserved.sol");
const utils = require('./helpers/Utils');

contract('AlbosToken', function(accounts) {

  it('verifies the token name after construction', async () => {
    const token = await AlbosToken.new();
    const name = await token.name.call();
    assert.equal(name, 'ALBOS Token');
  });

  it('verifies the token symbol after construction', async () => {
    const token = await AlbosToken.new();
    const symbol = await token.symbol.call();
    assert.equal(symbol, 'ALB');
  });

  it('should allow when attempting to transfer to the new wallet', async () => {
    const token = await AlbosToken.new();

    try {
      await token.transfer(token.address, 10);
      assert(true, "allow");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the allowance after an approval', async () => {
    const token = await AlbosToken.new();
    await token.approve(accounts[1], 500);
    const allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 500);
  });

  it('verifies that an approval fires an Approval event', async () => {
    const token = await AlbosToken.new();
    await token.addPrivateSaleTokens(accounts[0], 500);
    const res = await token.approve(accounts[1], 500);
    assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
  });

  it('should throw when attempting to define transfer for an invalid address', async () => {
    const token = await AlbosToken.new();

    try {
      await token.transfer(utils.zeroAddress, 10);
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that transferring from another account fires a Transfer event', async () => {
    const token = await AlbosToken.new();
    await token.startListing();
    await token.addPrivateSaleTokens(accounts[0], 50000000000);
    await token.approve(accounts[1], 50000000000);
    const res = await token.transferFrom(accounts[0], accounts[2], 50000000000, { from: accounts[1] });
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies the new allowance after transferring from another account', async () => {
    const token = await AlbosToken.new();
    await token.startListing();
    await token.addPrivateSaleTokens(accounts[0], 50000000000);
    await token.approve(accounts[1], 50000000000);
    await token.transferFrom(accounts[0], accounts[2], 5000000000, { from: accounts[1] });
    const allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 45000000000);
  });

  it('should throw when attempting to transfer from another account more than the allowance', async () => {
    const token = await AlbosToken.new();
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
    const token = await AlbosToken.new();
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
    const token = await AlbosToken.new();
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
    const contract = await AlbosToken.new();
    const owner = await contract.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it('verifies the new owner after ownership transfer', async () => {
    const contract = await AlbosToken.new();
    await contract.transferOwnership(accounts[1]);
    const owner = await contract.owner.call();
    assert.equal(owner, accounts[1]);
  });

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    const contract = await AlbosToken.new();
    const res = await contract.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  });

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    const contract = await AlbosToken.new();
    await contract.renounceOwnership();
    const owner = await contract.owner.call();
    assert.equal(owner, utils.zeroAddress);
  });

  it('verifies that only the owner can initiate ownership transfer', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.transferOwnership(accounts[1], { from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addPrivateSale Airdrop Multi', async () => {
    const contract = await AlbosToken.new();
    await contract.addPrivateSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    const airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addPrivateSale', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addPrivateSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addPrivateSale Airdrop Multi accounts fires an Transfer event', async () => {
    const contract = await AlbosToken.new();
    const res = await contract.addPrivateSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addPrivateSaleTokens works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addPrivateSaleTokens(accounts[1], 1234);

    const isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    await contract.transfer(accounts[4], 1234, { from: accounts[1] });
  });

  it('verifies that only the owner can initiate addPrivateSaleTokens', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addPrivateSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the new agent after setNewAgent', async () => {
    const contract = await AlbosToken.new();
    const agent = await contract.agentAddress.call();
    assert.equal(agent, accounts[0]);
    await contract.transferAgent(accounts[1]);
    const newAgent = await contract.agentAddress.call();
    assert.equal(newAgent, accounts[1]);
  });

  it('verifies that only the owner can initiate setNewAgent', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.transferAgent(accounts[1], { from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addPreSaleTokensMulti Airdrop Multi', async () => {
    const contract = await AlbosToken.new();
    await contract.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    const airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    const airdropFisrt2 = await contract.preSaleTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await contract.preSaleTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await contract.preSaleTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addPreSaleTokensMulti', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addPreSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addPreSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    const contract = await AlbosToken.new();
    const res = await contract.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addPreSaleTokens works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addPreSaleTokens(accounts[1], 1234);

    const isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    const preSaleTokens = await contract.preSaleTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1234);
  });

  it('verifies that only the owner can initiate addPreSaleTokens', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addPreSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addCrowdSaleTokensMulti Airdrop Multi', async () => {
    const contract = await AlbosToken.new();
    await contract.addCrowdSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    const airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    const airdropFisrt2 = await contract.crowdSaleTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await contract.crowdSaleTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await contract.crowdSaleTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addCrowdSaleTokensMulti', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addCrowdSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addCrowdSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    const contract = await AlbosToken.new();
    const res = await contract.addCrowdSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addCrowdSaleTokens works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addCrowdSaleTokens(accounts[1], 1234);

    const isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    const preSaleTokens = await contract.crowdSaleTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1234);
  });

  it('verifies that only the owner can initiate addCrowdSaleTokens', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addCrowdSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });


  it('verifies that array processing works correctly to addFrostTokensMulti Airdrop Multi', async () => {
    const contract = await AlbosToken.new();
    await contract.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);
    await contract.addFrostTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000], [111, 11, 1]);

    const airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    const airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    const airdropFisrt2 = await contract.freezeTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await contract.freezeTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await contract.freezeTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);

    const airdropFisrt23 = await contract.freezeTimeBlock.call(accounts[1]);
    assert.equal(airdropFisrt23.toNumber(), 111);
    const airdropSecond23 = await contract.freezeTimeBlock.call(accounts[2]);
    assert.equal(airdropSecond23.toNumber(), 11);
    const airdropThird23 = await contract.freezeTimeBlock.call(accounts[3]);
    assert.equal(airdropThird23.toNumber(), 1);
  });

  it('verifies that only the owner can initiate addFrostTokensMulti', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addFrostTokensMulti([accounts[1]], [6000000], [123], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addFrostTokens works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addPrivateSaleTokens(accounts[1], 1234);
    await contract.addFrostTokens(accounts[1], 1234, 4321);

    const isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    const preSaleTokens = await contract.freezeTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1234);

    const preSaleTokens1 = await contract.freezeTimeBlock.call(accounts[1]);
    assert.equal(preSaleTokens1.toNumber(), 4321);
  });

  it('verifies that only the owner can initiate addFrostTokens', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addFrostTokens([accounts[1]], 6000000, 4321, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that startListing works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();

    const preSaleTokens1 = await contract.listing.call();
    assert.equal(preSaleTokens1, true);
  });

  it('verifies that only the owner can initiate startListing', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.startListing({ from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate addStaff', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addStaff(accounts[1], { from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate killFrost', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.killFrost({ from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that pushing new address in staff array works correctly', async () => {
    const contract = await AlbosToken.new();

    await contract.addStaff(accounts[1]);
    let result = false;

    const staffArray = await contract.viewStaff.call();
    for (var i = 0; i < staffArray.length; i++) {
      if (staffArray[i] == accounts[1]) result = true;
    }

    assert.equal(result, true);

    await contract.startListing();
    await contract.addUniqueSaleTokens(accounts[1], 1000);
    await contract.addPreSaleTokens(accounts[1], 1000);
    await contract.addCrowdSaleTokens(accounts[1], 1000);
    
    try {
      await contract.transfer(accounts[3], 2000, {from: accounts[1]});
      assert(true, "throw");
    } catch(error) {
      throw new Error(error);
    }

  });

  it('verifies that maximum of addFrostTokens works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();

    const founderBalance15 = await contract.foundersSupply();
    const reservedBalance10 = await contract.foundersSupply();
    await contract.addFrostTokens(accounts[9], founderBalance15, 4321);

    try {
      await contract.addFrostTokens(accounts[9], reservedBalance10, 4321);
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that kill frost works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();

    await contract.addPrivateSaleTokens(accounts[1], 1234);
    await contract.addFrostTokens(accounts[1], 1234, 99999999);

    await contract.killFrost();
    
    try {
      await contract.transfer(accounts[3], 1234, {from: accounts[1]});
      assert(true, "throw");
    } catch(error) {
      throw new Error(error);
    }
  });

  it('verifies that array processing works correctly to addUniqueSaleTokens Multi', async () => {
    const contract = await AlbosToken.new();
    await contract.addUniqueSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    const airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);

    const airdropFisrt2 = await contract.uniqueTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await contract.uniqueTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await contract.uniqueTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addUniqueSaleTokensMulti', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addUniqueSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addUniqueSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    const contract = await AlbosToken.new();
    const res = await contract.addUniqueSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addUniqueSaleTokens works correctly', async () => {
    const contract = await AlbosToken.new();
    await contract.startListing();
    await contract.addUniqueSaleTokens(accounts[1], 1234);

    const isLockedFirst = await contract.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    const uniqueTokens = await contract.uniqueTokens.call(accounts[1]);
    assert.equal(uniqueTokens.toNumber(), 1234);
  });

  it('verifies that only the owner can initiate addUniqueSaleTokens', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.addUniqueSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate setFoundersContract', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.setFoundersContract(accounts[1], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate setReservedContract', async () => {
    const contract = await AlbosToken.new();

    try {
      await contract.setReservedContract(accounts[1], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that founders and reversed tokens return works correctly', async () => {
    const albos = await AlbosToken.new();
    const founders = await Founders.new(albos.address, accounts[8]);
    const reserved = await Reserved.new(albos.address, accounts[8]);

    await albos.setFoundersContract(founders.address);
    await albos.setReservedContract(reserved.address);
    
    assert.equal(await founders.albosAddress(), albos.address);
    assert.equal(await founders.owner(), albos.address);
    assert.equal(await reserved.albosAddress(), albos.address);
    assert.equal(await reserved.owner(), albos.address);

    assert.equal(await albos.foundersAddress(), founders.address);
    assert.equal(await albos.reservedAddress(), reserved.address);

    assert.equal(await founders.foundersWallet(), accounts[8]);
    assert.equal(await reserved.reservedWallet(), accounts[8]);

    const foundersBalance = await albos.balanceOf.call(founders.address);
    const founderSupply = await albos.foundersSupply();
    const reservedBalance = await albos.balanceOf.call(founders.address);
    const reservedSupply = await albos.foundersSupply();

    assert.equal(foundersBalance.toNumber(), founderSupply.toNumber());
    assert.equal(reservedBalance.toNumber(), reservedSupply.toNumber());

    await albos.startListing();
    await founders.getFoundersTokens(0, { from: accounts[8] });
    await reserved.getReservedTokens(0, { from: accounts[8] });
  });
});


contract('Founders', function(accounts) {
  it('verifies that only the initial wallet can get tokens', async () => {
    const albos = await AlbosToken.new();
    const founders = await Founders.new(albos.address, accounts[8]);
    await albos.startListing();

    try {
      await founders.getFoundersTokens(0, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });
});

contract('Reserved', function(accounts) {
  it('verifies that only the initial wallet can get tokens', async () => {
    const albos = await AlbosToken.new();
    const reserved = await Reserved.new(albos.address, accounts[8]);
    await albos.startListing();

    try {
      await reserved.getReservedTokens(0, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });
});