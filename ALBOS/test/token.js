const AlbosToken = artifacts.require("./AlbosToken.sol");
const AlbosWallet = artifacts.require("./AlbosWallet.sol");
const utils = require('./helpers/Utils');

contract('AlbosToken', function(accounts) {
  let albos

  beforeEach('setup contract for each test', async function () {
    albos = await AlbosToken.new();
  })

  it('verifies the albos name after construction', async () => {
    const name = await albos.name.call();
    assert.equal(name, 'ALBOS Token');
  });

  it('verifies the albos symbol after construction', async () => {
    const symbol = await albos.symbol.call();
    assert.equal(symbol, 'ALB');
  });

  it('should allow when attempting to transfer to the new wallet', async () => {
    try {
      await albos.transfer(albos.address, 10);
      assert(true, "allow");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the allowance after an approval', async () => {
    await albos.approve(accounts[1], 500);
    const allowance = await albos.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 500);
  });

  it('verifies that an approval fires an Approval event', async () => {
    await albos.addPrivateSaleTokens(accounts[0], 500);
    const res = await albos.approve(accounts[1], 500);
    assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
  });

  it('should throw when attempting to define transfer for an invalid address', async () => {
    try {
      await albos.transfer(utils.zeroAddress, 10);
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that transferring from another account fires a Transfer event', async () => {
    await albos.startListing();
    await albos.addPrivateSaleTokens(accounts[0], 50000000000);
    await albos.approve(accounts[1], 50000000000);
    const res = await albos.transferFrom(accounts[0], accounts[2], 50000000000, { from: accounts[1] });
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies the new allowance after transferring from another account', async () => {
    await albos.startListing();
    await albos.addPrivateSaleTokens(accounts[0], 50000000000);
    await albos.approve(accounts[1], 50000000000);
    await albos.transferFrom(accounts[0], accounts[2], 5000000000, { from: accounts[1] });
    const allowance = await albos.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 45000000000);
  });

  it('should throw when attempting to transfer from another account more than the allowance', async () => {
    await albos.approve(accounts[1], 100);
    try {
        await albos.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('should throw when attempting to transfer from an invalid account', async () => {
    await albos.approve(accounts[1], 100);
    try {
        await albos.transferFrom(utils.zeroAddress, accounts[2], 50, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('should throw when attempting to transfer from to an invalid account', async () => {
    await albos.approve(accounts[1], 100);
    try {
        await albos.transferFrom(accounts[0], utils.zeroAddress, 50, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the owner after construction', async () => {
    const owner = await albos.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it('verifies the new owner after ownership transfer', async () => {
    await albos.transferOwnership(accounts[1]);
    const owner = await albos.owner.call();
    assert.equal(owner, accounts[1]);
  });

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    const res = await albos.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  });

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    await albos.renounceOwnership();
    const owner = await albos.owner.call();
    assert.equal(owner, utils.zeroAddress);
  });

  it('verifies that only the owner can initiate ownership transfer', async () => {
    try {
      await albos.transferOwnership(accounts[1], { from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addPrivateSale Airdrop Multi', async () => {
    await albos.addPrivateSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await albos.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    const airdropSecond = await albos.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await albos.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addPrivateSale', async () => {
    try {
      await albos.addPrivateSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addPrivateSale Airdrop Multi accounts fires an Transfer event', async () => {
    const res = await albos.addPrivateSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addPrivateSaleTokens works correctly', async () => {
    await albos.startListing();
    await albos.addPrivateSaleTokens(accounts[1], 1234);

    const isLockedFirst = await albos.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 1234);

    await albos.transfer(accounts[4], 1234, { from: accounts[1] });
  });

  it('verifies that only the owner can initiate addPrivateSaleTokens', async () => {
    try {
      await albos.addPrivateSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the new agent after setNewAgent', async () => {
    const agent = await albos.agentAddress.call();
    assert.equal(agent, accounts[0]);
    await albos.transferAgent(accounts[1]);
    const newAgent = await albos.agentAddress.call();
    assert.equal(newAgent, accounts[1]);
  });

  it('verifies that only the owner can initiate setNewAgent', async () => {
    try {
      await albos.transferAgent(accounts[1], { from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addPreSaleTokensMulti Airdrop Multi', async () => {
    await albos.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await albos.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 400);
    const airdropSecond = await albos.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await albos.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 600);

    const airdropFisrt2 = await albos.preSaleTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await albos.preSaleTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await albos.preSaleTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addPreSaleTokensMulti', async () => {
    try {
      await albos.addPreSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addPreSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    const res = await albos.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addPreSaleTokens works correctly', async () => {
    await albos.startListing();
    await albos.addPreSaleTokens(accounts[1], 1000);

    const isLockedFirst = await albos.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 100);

    const preSaleTokens = await albos.preSaleTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1000);
  });

  it('verifies that only the owner can initiate addPreSaleTokens', async () => {
    try {
      await albos.addPreSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that array processing works correctly to addCrowdSaleTokensMulti Airdrop Multi', async () => {
    await albos.addCrowdSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await albos.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 800);
    const airdropSecond = await albos.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    const airdropThird = await albos.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 1200);

    const airdropFisrt2 = await albos.crowdSaleTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await albos.crowdSaleTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await albos.crowdSaleTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addCrowdSaleTokensMulti', async () => {
    try {
      await albos.addCrowdSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addCrowdSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    const res = await albos.addCrowdSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addCrowdSaleTokens works correctly', async () => {
    await albos.startListing();
    await albos.addCrowdSaleTokens(accounts[1], 1000);

    const isLockedFirst = await albos.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 200);

    const preSaleTokens = await albos.crowdSaleTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1000);
  });

  it('verifies that only the owner can initiate addCrowdSaleTokens', async () => {
    try {
      await albos.addCrowdSaleTokens([accounts[1]], 6000000, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  // can frost only balance
  it('verifies that array processing works correctly to addFrostTokensMulti Airdrop Multi', async () => {
    await albos.addPreSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 10, 6000]);
    await albos.addFrostTokensMulti([accounts[1], accounts[2], accounts[3]], [400, 1, 600], [1112111231321131123133211, 1112111231321131123133211, 1112111231321131123133211]);

    const airdropFisrt = await albos.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 0);
    const airdropSecond = await albos.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 0);
    const airdropThird = await albos.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 0);

    const airdropFisrt2 = await albos.freezeTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 400);
    const airdropSecond2 = await albos.freezeTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await albos.freezeTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 600);

    const airdropFisrt23 = await albos.freezeTimeBlock.call(accounts[1]);
    assert.equal(airdropFisrt23.toNumber(), 1112111231321131123133211);
    const airdropSecond23 = await albos.freezeTimeBlock.call(accounts[2]);
    assert.equal(airdropSecond23.toNumber(), 1112111231321131123133211);
    const airdropThird23 = await albos.freezeTimeBlock.call(accounts[3]);
    assert.equal(airdropThird23.toNumber(), 1112111231321131123133211);
  });

  it('verifies that only the owner can initiate addFrostTokensMulti', async () => {
    try {
      await albos.addFrostTokensMulti([accounts[1]], [6000000], [123], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addFrostTokens works correctly', async () => {
    await albos.startListing();
    await albos.addPrivateSaleTokens(accounts[1], 1000);
    await albos.addFrostTokens(accounts[1], 1000, 432127381311);

    const isLockedFirst = await albos.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 0);

    const preSaleTokens = await albos.freezeTokens.call(accounts[1]);
    assert.equal(preSaleTokens.toNumber(), 1000);

    const preSaleTokens1 = await albos.freezeTimeBlock.call(accounts[1]);
    assert.equal(preSaleTokens1.toNumber(), 432127381311);
  });

  it('verifies that only the owner can initiate addFrostTokens', async () => {
    try {
      await albos.addFrostTokens([accounts[1]], 6000000, 4321, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that startListing works correctly', async () => {
    await albos.startListing();
    const preSaleTokens1 = await albos.listing.call();
    assert.equal(preSaleTokens1, true);
  });

  it('verifies that only the owner can initiate startListing', async () => {
    try {
      await albos.startListing({ from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate addStaff', async () => {
    try {
      await albos.addStaff(accounts[1], { from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate killFrost', async () => {
    try {
      await albos.killFrost({ from: accounts[2] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that pushing new address in staff works correctly', async () => {
    await albos.addStaff(accounts[1]);

    const staffMapping = await albos.staff.call(accounts[1]);
    assert.equal(staffMapping, true);

    await albos.startListing();
    await albos.addUniqueSaleTokens(accounts[1], 1000);
    await albos.addPreSaleTokens(accounts[1], 1000);
    await albos.addCrowdSaleTokens(accounts[1], 1000);
    
    try {
      await albos.transfer(accounts[3], 2000, {from: accounts[1]});
      assert(true, "throw");
    } catch(error) {
      throw new Error(error);
    }

  });

  it('verifies that maximum of addFrostTokens works correctly', async () => {
    await albos.startListing();

    const founderBalance15 = await albos.foundersSupply();
    const reservedBalance10 = await albos.foundersSupply();
    await albos.addFrostTokens(accounts[9], founderBalance15, 43218781273912312);

    try {
      await albos.addFrostTokens(accounts[9], reservedBalance10, 43218781273912312);
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that kill frost works correctly', async () => {
    await albos.startListing();

    await albos.addPrivateSaleTokens(accounts[1], 1234);
    await albos.addFrostTokens(accounts[1], 1234, 99999999);

    await albos.killFrost();
    
    try {
      await albos.transfer(accounts[3], 1234, {from: accounts[1]});
      assert(true, "throw");
    } catch(error) {
      throw new Error(error);
    }
  });

  it('verifies that array processing works correctly to addUniqueSaleTokens Multi', async () => {
    await albos.addUniqueSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    const airdropFisrt = await albos.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 0);
    const airdropSecond = await albos.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 0);
    const airdropThird = await albos.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 0);

    const airdropFisrt2 = await albos.uniqueTokens.call(accounts[1]);
    assert.equal(airdropFisrt2.toNumber(), 4000);
    const airdropSecond2 = await albos.uniqueTokens.call(accounts[2]);
    assert.equal(airdropSecond2.toNumber(), 1);
    const airdropThird2 = await albos.uniqueTokens.call(accounts[3]);
    assert.equal(airdropThird2.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate addUniqueSaleTokensMulti', async () => {
    try {
      await albos.addUniqueSaleTokensMulti([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that addUniqueSaleTokensMulti Airdrop Multi accounts fires an Transfer event', async () => {
    const res = await albos.addUniqueSaleTokensMulti([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies that addUniqueSaleTokens works correctly', async () => {
    await albos.startListing();
    await albos.addUniqueSaleTokens(accounts[1], 1234);

    const isLockedFirst = await albos.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 0);

    const uniqueTokens = await albos.uniqueTokens.call(accounts[1]);
    assert.equal(uniqueTokens.toNumber(), 1234);
  });

  it('verifies that transferAndFrostTokens works correctly', async () => {
    await albos.startListing();
    await albos.transferAndFrostTokens(accounts[1], 1234, 991312312312399);

    const isLockedFirst = await albos.balanceOf.call(accounts[1]);
    assert.equal(isLockedFirst.toNumber(), 0);

    const uniqueTokens = await albos.freezeTokens.call(accounts[1]);
    assert.equal(uniqueTokens.toNumber(), 1234);
  });

  it('verifies that only the owner can initiate setTeamContract', async () => {
    try {
      await albos.setTeamContract(accounts[1], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate transferAndFrostTokens', async () => {
    try {
      await albos.transferAndFrostTokens(accounts[1], 1231, 121331, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that founders and reversed tokens return works correctly', async () => {
    const albos = await AlbosToken.new();
    const wallet = await AlbosWallet.new(albos.address, accounts[8]);

    await albos.setTeamContract(wallet.address);
    
    assert.equal(await wallet.albosAddress(), albos.address);
    assert.equal(await wallet.owner(), albos.address);
    assert.equal(await albos.albosWallet(), wallet.address);
    assert.equal(await wallet.teamWallet(), accounts[8]);

    const albosBalance = await albos.balanceOf.call(albos.address);
    const walletBalance = await albos.balanceOf.call(wallet.address);

    console.log(albosBalance);
    console.log(walletBalance);

    await albos.startListing();
    await wallet.getTokens(0, { from: accounts[8] });
  });
});

contract('AlbosWallet', function(accounts) {
  let albos

  beforeEach('setup contract for each test', async function () {
    albos = await AlbosToken.new();
  })

  it('verifies that only the initial wallet can get tokens', async () => {
    const albosWallet = await AlbosWallet.new(albos.address, accounts[8]);
    await albos.startListing();

    try {
      await albosWallet.getTokens(0, { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });
});