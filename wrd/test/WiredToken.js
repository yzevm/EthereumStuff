const TokenData = artifacts.require("./TokenData.sol");
const helper = require("./helpers/truffleTestHelper");


// describe("Testing Helper Functions", () => {
//     it("should advance the blockchain forward a block", async () =>{
//         const originalBlockHash = web3.eth.getBlock('latest').hash;
//         let newBlockHash = web3.eth.getBlock('latest').hash;

//         newBlockHash = await helper.advanceBlock();

//         assert.notEqual(originalBlockHash, newBlockHash);
//     });

//     it("should be able to advance time and block together", async () => {
//         const advancement = 600;
//         const originalBlock = web3.eth.getBlock('latest');
//         const newBlock = await helper.advanceTimeAndBlock(advancement);
//         const timeDiff = newBlock.timestamp - originalBlock.timestamp;

//         assert.isTrue(timeDiff >= advancement);
//     });
// });



contract('TokenData', accounts => {
  let data

  beforeEach('setup contract for each test', async function () {
    data = await TokenData.new(accounts[7], {gas: 8000000})
    await data.startListing()
  })

  it('verifies the name after construction', async () => {
    const agentAddress = await data.agentAddress.call()
    const staffOwner = await data.staff.call(accounts[0])
    const staffData = await data.staff.call(data.address)

    const balanceData = await data.WRDbalances.call(data.address)
    const balanceFounder = await data.WRDbalances.call(accounts[7])
    const presaleFounder = await data.presaleTokens.call(accounts[7])
    
    assert.equal(agentAddress, accounts[0])
    assert.equal(staffOwner, true)
    assert.equal(staffData, true)

    assert.equal(balanceData.toNumber(), 7.8e+29)
    assert.equal(balanceFounder.toNumber(), 5.2e+29)
    assert.equal(presaleFounder.toNumber(), 5.2e+29)
  })

  it('verifies the owner after construction', async () => {
    const owner = await data.owner.call();
    assert.equal(owner, accounts[0]);
  })

  it('verifies the new owner after ownership transfer', async () => {
    await data.transferOwnership(accounts[1]);
    const owner = await data.owner.call();
    assert.equal(owner, accounts[1]);
  })

  it('verifies that ownership transfer fires an OwnershipTransferred event', async () => {
    const res = await data.transferOwnership(accounts[1]);
    assert(res.logs.length > 0 && res.logs[0].event == 'OwnershipTransferred');
  })

  it('verifies that newOwner is cleared after ownership transfer', async () => {
    await data.renounceOwnership();
    const owner = await data.owner.call();
    assert.equal(owner, helper.zeroAddress);
  })

  it('verifies that only the owner can initiate ownership transfer', async () => {
    try {
      await data.transferOwnership(accounts[1], { from: accounts[2] })
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies the listing status', async () => {
    const listingStatus = await data.listing.call()
    assert.equal(listingStatus, true)
  })

  it('verifies that only the owner can do listing', async () => {
    try {
      await data.startListing({ from: accounts[2] })
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies the add staff', async () => {
    await data.addStaff(accounts[2], true)
    const newStaff = await data.staff.call(accounts[2])
    assert.equal(newStaff, true)
  })

  it('verifies that only the owner can add staff', async () => {
    try {
      await data.addStaff(accounts[2], true, { from: accounts[2] })
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies the transfer agent', async () => {
    await data.transferAgent(accounts[2])
    const newAgent = await data.agentAddress.call()
    assert.equal(newAgent, accounts[2])
  })

  it('verifies that only the owner can transfer agent', async () => {
    try {
      await data.transferAgent(accounts[2], { from: accounts[2] })
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies the add Airdrop Tokens', async () => {
    await data.addAirdropTokens([accounts[2]], [100])
    const airdroper = await data.airdropTokens.call(accounts[2])
    const timeAir = await data.startTime.call(accounts[2])
    const total = await data.totalAirdropTokens.call()
    assert.equal(total, 100)
    assert.equal(airdroper, 100)
    assert.equal(timeAir.toNumber() > 0, true)
  })

  it('verifies that only the owner can add Airdrop Tokens', async () => {
    try {
      await data.addAirdropTokens([accounts[2]], [100], {from: accounts[2]})
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies the add Presale Tokens', async () => {
    await data.addPresaleTokens([accounts[2]], [100])
    const presaler = await data.presaleTokens.call(accounts[2])
    const timeSale = await data.startTime.call(accounts[2])
    const total = await data.totalPresaleTokens.call()
    assert.equal(total.toNumber(), 100)
    assert.equal(presaler.toNumber(), 100)
    assert.equal(timeSale.toNumber() > 0, true)
  })

  it('verifies that only the owner can add Presale Tokens', async () => {
    try {
      await data.addPresaleTokens([accounts[2]], [100], {from: accounts[2]})
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies the lockup/generate logic', async () => {
    const presale = await data.presaleTokens.call(accounts[0])
    const airdrop = await data.airdropTokens.call(accounts[0])
    const lookBonus = await data.lookBonus.call(accounts[0])
    const lookBalanceWRD = await data.lookBalanceWRD.call(accounts[0])
    const balanceWRD = await data.WRDbalances.call(accounts[0])
    const balanceWR2 = await data.WR2balances.call(accounts[0])

    const update = await data.lastUpdate.call(accounts[0])

    assert.equal(balanceWRD.toNumber(), 5000)
    assert.equal(balanceWR2.toNumber(), 1000)

    assert.equal(presale.toNumber(), 500)
    assert.equal(airdrop.toNumber(), 100)
    assert.equal(Array.isArray(lookBonus), true)
    assert.equal(lookBalanceWRD.toNumber(), 4400)
    assert.equal(update.toNumber(), 0)

    await data.updateBonus(accounts[0])

    const presale1 = await data.presaleTokens.call(accounts[0])
    const airdrop1 = await data.airdropTokens.call(accounts[0])

    const lookBonus1 = await data.lookBonus.call(accounts[0])
    const lookBalanceWRD1 = await data.lookBalanceWRD.call(accounts[0])
    const balanceWRD1 = await data.WRDbalances.call(accounts[0])
    const balanceWR21 = await data.WR2balances.call(accounts[0])
    const update1 = await data.lastUpdate.call(accounts[0])

    assert.equal(presale1.toNumber(), 500)
    assert.equal(airdrop1.toNumber(), 100)
    assert.equal(lookBonus1[0].toNumber(), 0)

    assert.equal(lookBalanceWRD1.toNumber(), 18283)
    assert.equal(balanceWRD1.toNumber(), 18883)
    assert.equal(balanceWR21.toNumber(), 17824)

    assert.equal(update1.toNumber() > 0, true)
  })

  it('verifies that only the owner can transferWRD', async () => {
    try {
      await data.transferWRD(accounts[2], accounts[2], 100, {from: accounts[2]})
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })

  it('verifies that only the owner can transferWRD', async () => {
    try {
      await data.transferWR2(accounts[2], accounts[2], 100, {from: accounts[2]})
      assert(false, "didn't throw")
    } catch (error) {
      return helper.ensureException(error);
    }
  })
})
