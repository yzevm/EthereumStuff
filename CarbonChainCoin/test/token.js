const CarbonChainCoin = artifacts.require("./CarbonChainCoin.sol");
const utils = require('./helpers/Utils');

contract('CarbonChainCoin', function(accounts) {

  it('verifies the token name after construction', async () => {
    let token = await CarbonChainCoin.new();
    let name = await token.name.call();
    assert.equal(name, 'Carbon Chain Coin');
  });

  it('verifies the token symbol after construction', async () => {
    let token = await CarbonChainCoin.new();
    let symbol = await token.symbol.call();
    assert.equal(symbol, 'CCC');
  });

  it('verifies the balance and supply', async () => {
    let token = await CarbonChainCoin.new();
    let balance = await token.balanceOf.call(token.address);
    assert.equal(balance, 350000000000000000000000000);
    let supply = await token.totalSupply.call();
    assert.equal(supply, 350000000000000000000000000);
  });

  it('verifies the balances after a transfer', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(50000000000000000000000000);
    let balance;
    balance = await token.balanceOf.call(token.address);
    assert.equal(balance.toNumber(), 300000000000000000000000000);
    balance = await token.balanceOf.call(accounts[0]);
    assert.equal(balance.toNumber(), 50000000000000000000000000);
  });

  it('should allow when attempting to transfer to the new wallet', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(10);
    try {
      await token.transfer(token.address, 10);
      assert(true, "allow");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies the allowance after an approval', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(500);
    await token.approve(accounts[1], 500);
    let allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 500);
  });

  it('verifies that an approval fires an Approval event', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(500);
    let res = await token.approve(accounts[1], 500);
    assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
  });

  it('should throw when attempting to define transfer for an invalid address', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(10);
    try {
        await token.transfer(utils.zeroAddress, 10);
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that transferring from another account fires a Transfer event', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(50000000000);
    await token.approve(accounts[1], 50000000000);
    let res = await token.transferFrom(accounts[0], accounts[2], 50000000000, { from: accounts[1] });
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });

  it('verifies the new allowance after transferring from another account', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(50000000000);
    await token.approve(accounts[1], 50000000000);
    await token.transferFrom(accounts[0], accounts[2], 5000000000, { from: accounts[1] });
    let allowance = await token.allowance.call(accounts[0], accounts[1]);
    assert.equal(allowance, 45000000000);
  });

  it('should throw when attempting to transfer from another account more than the allowance', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(100);
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
    let token = await CarbonChainCoin.new();
    await token.transferTokens(100);
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
    let token = await CarbonChainCoin.new();
    await token.transferTokens(100);
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
    let contract = await CarbonChainCoin.new();
    let owner = await contract.owner.call();
    assert.equal(owner, accounts[0]);
  });

  it('verifies the new owner after ownership transfer', async () => {
    let contract = await CarbonChainCoin.new();
    await contract.transferOwnership(accounts[1]);
    let owner = await contract.owner.call();
    assert.equal(owner, accounts[1]);
  });

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    let contract = await CarbonChainCoin.new();
    let res = await contract.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  });

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    let contract = await CarbonChainCoin.new();
    await contract.renounceOwnership();
    let owner = await contract.owner.call();
    assert.equal(owner, utils.zeroAddress);
  });

  it('verifies that only the owner can initiate ownership transfer', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.transferOwnership(accounts[1], { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the agent after construction', async () => {
    let contract = await CarbonChainCoin.new();
    let agent = await contract.agent.call();
    assert.equal(agent, accounts[0]);
  });

  it('verifies the new agent after agentship transfer', async () => {
    let contract = await CarbonChainCoin.new();
    await contract.transferAgent(accounts[1]);
    let agent = await contract.agent.call();
    assert.equal(agent, accounts[1]);
  });

  it('verifies that only the agent can initiate agentship transfer', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.transferAgent(accounts[1], { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the balance and supply after burning', async () => {
    let token = await CarbonChainCoin.new();
    await token.transferTokens(350000000000000000000000000);
    let balance = await token.balanceOf.call(accounts[0]);
    assert.equal(balance.toNumber(), 350000000000000000000000000);
    await token.burn(350000000000000000000000000);
    let newBalance = await token.balanceOf.call(accounts[0]);
    assert.equal(newBalance.toNumber(), 0);
    let supply = await token.totalSupply.call();
    assert.equal(supply.toNumber(), 0);
  });

  it('verifies that array processing works correctly to distribute Airdrop', async () => {
    let contract = await CarbonChainCoin.new();
    await contract.airdrop([accounts[1], accounts[2], accounts[3]], [4000, 1, 6000]);

    let airdropFisrt = await contract.balanceOf.call(accounts[1]);
    assert.equal(airdropFisrt.toNumber(), 4000);
    let airdropSecond = await contract.balanceOf.call(accounts[2]);
    assert.equal(airdropSecond.toNumber(), 1);
    let airdropThird = await contract.balanceOf.call(accounts[3]);
    assert.equal(airdropThird.toNumber(), 6000);
  });

  it('verifies that only the owner can initiate distributeAirdropMulti', async () => {
    let contract = await CarbonChainCoin.new();

    try {
      await contract.airdrop([accounts[1]], [6000000], { from: accounts[1] });
      assert(false, "didn't throw");
    }
    catch (error) {
      return utils.ensureException(error);
    }
  });

  it('verifies that distribute Airdrop Multi accounts fires an Transfer event', async () => {
    let contract = await CarbonChainCoin.new();
    let res = await contract.airdrop([accounts[1], accounts[2], accounts[3]], [6000000, 123, 111]);
    assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
  });


  it('check the destibute amount', async () => {
    let contract = await CarbonChainCoin.new();
    let amount = await contract.distributeAmount.call();
    assert.equal(amount.toNumber(), 248500000000000000000000000);
  });

  it('verifies the new ETHUSD after update Price Manualy', async () => {
    let contract = await CarbonChainCoin.new();
    let ETHUSD = await contract.ETHUSD.call();
    assert.equal(ETHUSD, 600);
    await contract.updatePriceManualy(10);
    let ETHUSDnew = await contract.ETHUSD.call();
    assert.equal(ETHUSDnew, 10);
  });

  it('verifies that only the owner can initiate update Price Manualy', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.updatePriceManualy(10, { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies the new oraclizeOn after turn Off/On Oraclize', async () => {
    let contract = await CarbonChainCoin.new();
    let oraclizeOn = await contract.oraclizeOn.call();
    assert.equal(oraclizeOn, true);
    await contract.turnOffOraclize();
    let oraclizeOnNew = await contract.oraclizeOn.call();
    assert.equal(oraclizeOnNew, false);
    await contract.turnOnOraclize();
    let oraclizeOnNewSecond = await contract.oraclizeOn.call();
    assert.equal(oraclizeOnNewSecond, true);
  });

  it('verifies that only the owner can initiate turn Off Oraclize', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.turnOffOraclize({ from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate turn On Oraclize', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.turnOnOraclize({ from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate ethers transfer', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.returnEthers({ from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });
  
  it('verifies the transfer tokens from contract works correctly', async () => {
    let contract = await CarbonChainCoin.new();
    let firstBalance = await contract.balanceOf.call(contract.address);
    assert.equal(firstBalance.toNumber(), 350000000000000000000000000);

    await contract.transferTokens(350000000000000000000000000);

    let secondBalance = await contract.balanceOf.call(contract.address);
    assert.equal(secondBalance.toNumber(), 0);

    let ownerBalance = await contract.balanceOf.call(accounts[0]);
    assert.equal(ownerBalance.toNumber(), 350000000000000000000000000);
  });

  it('verifies that only the owner can initiate transfer tokens', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.transferTokens(410000000000, { from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });

  it('verifies that only the owner can initiate update Price', async () => {
    let contract = await CarbonChainCoin.new();

    try {
        await contract.updatePrice({ from: accounts[2] });
        assert(false, "didn't throw");
    }
    catch (error) {
        return utils.ensureException(error);
    }
  });
});