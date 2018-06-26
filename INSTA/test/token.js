const InstaToken = artifacts.require("./InstaToken.sol");
const InstaPresale = artifacts.require("./InstaPresale.sol");
const utils = require('./helpers/Utils');
const BigNumber = require('./helpers/big-number');

const treasuryWallet = '0xEa11755Ae41D889CeEc39A63E6FF75a02Bc1C00d'; // change
const devWallet = '0x39Bb259F66E1C59d5ABEF88375979b4D20D98022'; // change
const partnersWallet = '0x4092678e4E78230F46A1534C0fbc8fA39780892B';
const foundersWallet = '0x6748F50f686bfbcA6Fe8ad62b22228b87F31ff2b'; 

const monthSeconds = 2592000;
const secsPerBlock = 15;


contract('InstaToken', function(accounts) {

  it('verifies the token name and symbol after construction', async () => {
    let token = await InstaToken.new();
    let name = await token.name.call();
    assert.equal(name, 'INSTA');
    let symbol = await token.symbol.call();
    assert.equal(symbol, 'INSTA');
  });

  it('verifies the balances and supply', async () => {
    let token = await InstaToken.new();
    let supply = await token.totalSupply.call();
    assert.equal(supply.toNumber(), 1000000000000000000000000000);
    let balanceFoundersAndPartners = await token.balanceOf.call(token.address);
    assert.equal(balanceFoundersAndPartners.toNumber(), 400000000000000000000000000);
    let balanceOwner = await token.balanceOf.call(accounts[0]);
    assert.equal(balanceOwner.toNumber(), 400000000000000000000000000);
    let balanceTreasury = await token.balanceOf.call(treasuryWallet);
    assert.equal(balanceTreasury.toNumber(), 150000000000000000000000000);
    let balanceComDev = await token.balanceOf.call(devWallet);
    assert.equal(balanceComDev.toNumber(), 50000000000000000000000000);
  });

  it('verifies the balances after a transfer and burn that only owner can transfer tokens without limits', async () => {
    let token = await InstaToken.new();
    await token.transfer(accounts[1], 200000000000000000000000000)
    balance1 = await token.balanceOf.call(accounts[0]);
    assert.equal(balance1.toNumber(), 200000000000000000000000000);
    await token.burn(200000000000000000000000000)
    balance2 = await token.balanceOf.call(accounts[0]);
    assert.equal(balance2.toNumber(), 0);
  });

  it('should throw when not owner transfer tokens before launch date', async () => {
    let token = await InstaToken.new();

    await token.transfer(accounts[1], 10);

    try {
      await token.transfer(token.address, 10, { from: accounts[1] });
      assert(false, "allow");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('should throw bacause 2 weeks is not up', async () => {
    let token = await InstaToken.new();
    await token.approve(accounts[1], 100);

    try {
        await token.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the allowance after an approval', async () => {
    let token = await InstaToken.new();
    balance = await token.balanceOf.call(accounts[0]);
    assert.equal(balance.toNumber(), 400000000000000000000000000);
    await token.approve(accounts[1], 500);
    let allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 500);
  });

  it('verifies that an approval fires an Approval event', async () => {
    let token = await InstaToken.new();
    let res = await token.approve(accounts[1], 500);
    assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
  });

  it('should throw when attempting to define transfer for an invalid address', async () => {
    let token = await InstaToken.new();

    try {
        await token.transfer(utils.zeroAddress, 10);
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the owner after construction', async () => {
    let contract = await InstaToken.new();
    let owner = await contract.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it('verifies the new owner after ownership transfer', async () => {
    let contract = await InstaToken.new();
    await contract.transferOwnership(accounts[1]);
    let owner = await contract.owner.call();
    assert.equal(owner, accounts[1]);
  });

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    let contract = await InstaToken.new();
    let res = await contract.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  });

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    let contract = await InstaToken.new();
    await contract.renounceOwnership();
    let owner = await contract.owner.call();
    assert.equal(owner, utils.zeroAddress);
  });

  it('verifies that only the owner can initiate ownership transfer', async () => {
    let contract = await InstaToken.new();

    try {
        await contract.transferOwnership(accounts[1], { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate setLaunchBlock and only once', async () => {
    let contract = await InstaToken.new();

    let launchBool = await contract.launch.call();
    assert.equal(launchBool, false);
    await contract.setLaunchBlock();
    let launchBool2 = await contract.launch.call();
    assert.equal(launchBool2, true);
    let launchBlock = await contract.launchBlock.call();
    assert.equal(launchBlock.toNumber(), web3.eth.blockNumber + (monthSeconds / secsPerBlock / 2));

    try {
        await contract.setLaunchBlock();
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate setLaunchBlock function', async () => {
    let contract = await InstaToken.new();

    try {
        await contract.setLaunchBlock({ from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the founderWallet can initiate getFoundersTokens function', async () => {
    let contract = await InstaToken.new();

    try {
        await contract.getFoundersTokens(100, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the partnerWallet can initiate getPartnersTokens function', async () => {
    let contract = await InstaToken.new();

    try {
        await contract.getPartnersTokens(100, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the addBonusTokens works correctly', async () => {
    let token = await InstaToken.new();

    await token.addBonusTokens(accounts[0], 300000000000000000000000000);
    let vestTokens = await token.checkVesting.call(accounts[0]);
    assert.equal(vestTokens.toNumber(), 100000000000000000000000000);
  });

  it('verifies that only the owner can initiate addBonusTokens function', async () => {
    let contract = await InstaToken.new();

    try {
        await contract.addBonusTokens(accounts[1], 100, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the freezeTokens works correctly', async () => {
    let token = await InstaToken.new();

    await token.freezeTokens(accounts[0], 300000000000000000000000000);
    let vest = await token.checkVesting.call(accounts[0]);
    assert.equal(vest.toNumber(), 100000000000000000000000000);
  });

  it('verifies that only the owner can initiate freezeTokens function', async () => {
    let contract = await InstaToken.new();

    try {
        await contract.freezeTokens(accounts[1], 100, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

});










contract('InstaPresale', function(accounts) {

  it('verifies the balance and tokenReward', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);
    
    let ownerAddress = await sale.tokenReward.call();
    let balance = await token.balanceOf.call(ownerAddress);
    assert.equal(balance.toNumber(), 400000000000000000000000000);
  });

  it('verifies the startMainICO works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    await sale.startMainICO();
    let stageNum = await sale.stage.call();
    assert.equal(stageNum.toNumber(), 3);
  });

  it('verifies that only the owner can initiate startMainICO function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.startMainICO({ from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the finishMainICO works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    let ownerBalance = await token.balanceOf.call(accounts[0]);
    await token.transfer(sale.address, ownerBalance);
    await token.transferOwnership(sale.address);
    let newOwner = await token.owner.call();
    assert.equal(newOwner, sale.address);

    await sale.finishMainICO();
    let boolLaunch = await token.launch.call();
    assert.equal(boolLaunch, true);
    let balance = await token.balanceOf.call(sale.address);
    assert.equal(balance.toNumber(), 0);
  });

  it('verifies that only the owner can initiate finishMainICO function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.finishMainICO({ from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });
  
  it('verifies the updatePrice works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    await sale.updatePrice(777);
    let price = await sale.ETHUSD.call();
    assert.equal(price.toNumber(), 777);
  });

  it('verifies that only the owner can initiate updatePrice function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.updatePrice(777, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the transferAgent works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    await sale.transferAgent(accounts[5]);
    let newAgent = await sale.agent.call();
    assert.equal(newAgent, accounts[5]);
  });

  it('verifies that only the owner can initiate transferAgent function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
      await sale.transferAgent(accounts[5], { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the new owner after ownership transfer', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);
    await sale.transferOwnership(accounts[1]);
    let owner = await sale.owner.call();
    assert.equal(owner, accounts[1]);
  });

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);
    let res = await sale.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  });

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);
    await sale.renounceOwnership();
    let owner = await sale.owner.call();
    assert.equal(owner, utils.zeroAddress);
  });

  it('verifies that only the owner can initiate ownership transfer', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.transferOwnership(accounts[1], { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the addToWhiteList works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    await sale.addToWhiteList(accounts[4], true);
    let vest = await sale.whiteList.call(accounts[4]);
    assert.equal(vest, true);
  });

  it('verifies that only the owner can initiate addToWhiteList function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.addToWhiteList(accounts[4], true, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the addToWhiteListMulti works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    await sale.addToWhiteListMulti([accounts[2], accounts[3], accounts[4]]);
    let white1 = await sale.whiteList.call(accounts[2]);
    assert.equal(white1, true);
    let white2 = await sale.whiteList.call(accounts[3]);
    assert.equal(white2, true);
    let white3 = await sale.whiteList.call(accounts[4]);
    assert.equal(white3, true);
  });

  it('verifies that only the owner can initiate addToWhiteListMulti function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.addToWhiteListMulti([accounts[2], accounts[3], accounts[4]], { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate transferTokens function', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    try {
        await sale.transferTokens(accounts[1], 100, { from: accounts[1] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the transferTokens works correctly', async () => {
    let token = await InstaToken.new();
    let sale = await InstaPresale.new(token.address, accounts[7]);

    let million = 100000000; // 1 000 000 00
    let halfDecimals = 1000000000; // 1 000 000 000
    let price = 5;

    let ownerBalance = await token.balanceOf.call(accounts[0]);
    await token.transfer(sale.address, ownerBalance);
    await token.transferOwnership(sale.address);
    let newOwner = await token.owner.call();
    assert.equal(newOwner, sale.address);

    await sale.transferTokens(accounts[5], million * halfDecimals * halfDecimals);
    let bonus = await token.bonusVesting.call(accounts[5]);
    assert.equal(bonus.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(3).div(10).val()); // 30%

    let balance = await token.balanceOf.call(accounts[5]);
    assert.equal(balance.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(3).div(10).add(BigNumber(million).multiply(halfDecimals).multiply(halfDecimals)).val());

    let raised = await sale.usdRaised.call();
    assert.equal(raised.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(price).div(100).val());

    let stage = await sale.stage.call();
    assert.equal(stage.toNumber(), 1);

    //console.log(raised.toNumber() / 10 ** 24); // new stage

    await sale.transferTokens(accounts[5], million * halfDecimals * halfDecimals);
    let bonus2 = await token.bonusVesting.call(accounts[5]);
    assert.equal(bonus2.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(5).div(10).val()); // 30% + 20%

    let raised2 = await sale.usdRaised.call();
    assert.equal(raised2.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(price).div(100).multiply(2).val());

    let stage2 = await sale.stage.call();
    assert.equal(stage2.toNumber(), 2);

    //console.log(raised2.toNumber() / 10 ** 24); // new stage

    await sale.transferTokens(accounts[5], million * halfDecimals * halfDecimals);
    let bonus3 = await token.bonusVesting.call(accounts[5]);
    assert.equal(bonus3.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(6).div(10).val()); // 30% + 20% + 10%

    let raised3 = await sale.usdRaised.call();
    assert.equal(raised3.toNumber(), BigNumber(million).multiply(halfDecimals).multiply(halfDecimals).multiply(price).div(100).multiply(3).val());

    let stage3 = await sale.stage.call();
    assert.equal(stage3.toNumber(), 3);

    //console.log(raised3.toNumber() / 10 ** 24); // new stage

    await sale.addToWhiteList(accounts[8], true);
    await web3.eth.sendTransaction({
      from: accounts[8],
      to: sale.address,
      gas: 4000000,
      value: web3.toWei(1, "ether")
    });
    let buyerBalance = await token.balanceOf.call(accounts[8]);
    assert.equal(buyerBalance.toNumber(), BigNumber(halfDecimals).multiply(halfDecimals).multiply(500).multiply(5).div(100).val());

    try {
      await token.transfer(accounts[1], 100, { from: accounts[8] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });
});