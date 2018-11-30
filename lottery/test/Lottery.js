const BigNumber = web3.BigNumber
const EVMRevert = require('./helpers/EVMRevert')

const time = require('./helpers/time')
const { advanceBlock } = require('./helpers/advanceToBlock')
const { ether } = require('./helpers/ether')

const Web3 = require('web3')
const ETHER = 1000000000000000000
const APPROXIMATELY = 10000000000

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should()

const web3provider = new Web3(
  new Web3.providers.HttpProvider('http://localhost:8545')
)

const payEther = async function(target, options) {
  const preBalance = await web3provider.eth.getBalance(options.from)
  const { receipt } = await target.sendTransaction(options)
  const balance = await web3provider.eth.getBalance(options.from)
  const GAS_PRICE = 2
  const fee = Number(receipt.gasUsed) * GAS_PRICE // Number(await web3provider.eth.getGasPrice())

  const result = Number(balance) + options.value - (Number(preBalance) - fee)

  return result
}

const getBalance = async function(address) {
  return await web3provider.eth.getBalance(address)
}

const Contract = artifacts.require('Lottery')

contract('Lottery', function([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {
  beforeEach(async function() {
    await advanceBlock()
    this.contract = await Contract.new()
    this.startTime = await time.latest()
  })

  describe('deposit', function() {
    it('should work at least once', async function() {
      ;(await this.contract.depositsCountForUser.call(
        wallet1
      )).should.be.bignumber.equal(0)
      ;(await this.contract.totalDeposits.call()).should.be.bignumber.equal(0)

      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })
      ;(await this.contract.depositsCountForUser.call(
        wallet1
      )).should.be.bignumber.equal(1)
      ;(await this.contract.totalDeposits.call()).should.be.bignumber.equal(
        ether(1)
      )
    })

    it('should work at least twice from one address', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })
      ;(await this.contract.depositsCountForUser.call(
        wallet1
      )).should.be.bignumber.equal(1)
      ;(await this.contract.totalDeposits.call()).should.be.bignumber.equal(
        ether(1)
      )

      await this.contract.sendTransaction({ value: ether(2), from: wallet1 })
      ;(await this.contract.depositsCountForUser.call(
        wallet1
      )).should.be.bignumber.equal(2)
      ;(await this.contract.totalDeposits.call()).should.be.bignumber.equal(
        ether(3)
      )
    })

    it('should work at least twice from different addresses', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })
      ;(await this.contract.depositsCountForUser.call(
        wallet1
      )).should.be.bignumber.equal(1)
      ;(await this.contract.depositsCountForUser.call(
        wallet2
      )).should.be.bignumber.equal(0)
      ;(await this.contract.totalDeposits.call()).should.be.bignumber.equal(
        ether(1)
      )

      await this.contract.sendTransaction({ value: ether(2), from: wallet2 })
      ;(await this.contract.depositsCountForUser.call(
        wallet1
      )).should.be.bignumber.equal(1)
      ;(await this.contract.depositsCountForUser.call(
        wallet2
      )).should.be.bignumber.equal(1)
      ;(await this.contract.totalDeposits.call()).should.be.bignumber.equal(
        ether(3)
      )
    })

    it('should fail to create more than 50 deposits', async function() {
      for (let i = 0; i < 50; i++) {
        await this.contract.sendTransaction({
          value: ether(0.1),
          from: wallet1
        })
      }
      ;(await this.contract.depositsCountForUser(
        wallet1
      )).should.be.bignumber.equal(50)
      await this.contract
        .sendTransaction({ value: ether(0.1), from: wallet1 })
        .should.be.rejectedWith(EVMRevert)
    })

    it('should receive dividends for 50 deposits', async function() {
      for (let i = 0; i < 50; i++) {
        await this.contract.sendTransaction({
          value: ether(0.1),
          from: wallet1
        })
      }
      // console.log(
      await this.contract.sendTransaction({ value: 0, from: wallet1 })
      // );
    })

    it('should delete deposits after 50 days', async function() {
      for (let i = 0; i < 10; i++) {
        await this.contract.sendTransaction({
          value: ether(0.1),
          from: wallet1
        })
      }
      ;(await this.contract.depositsCountForUser(
        wallet1
      )).should.be.bignumber.equal(10)

      await time.increaseTo(
        this.startTime + time.duration.days(10) + time.duration.minutes(1)
      )

      for (let i = 0; i < 20; i++) {
        await this.contract.sendTransaction({
          value: ether(0.1),
          from: wallet1
        })
      }
      ;(await this.contract.depositsCountForUser(
        wallet1
      )).should.be.bignumber.equal(30)

      await time.increaseTo(
        this.startTime + time.duration.days(50) + time.duration.minutes(2)
      )

      await this.contract.sendTransaction({ value: ether(0), from: wallet1 })
      ;(await this.contract.depositsCountForUser(
        wallet1
      )).should.be.bignumber.equal(20)
    })
  })

  describe('referral', function() {
    it('should pay to referral 10% of sending amount', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      const referralBalance = await getBalance(wallet1)
      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet2,
        data: wallet1
      })
      const newReferralBalance = await getBalance(wallet1)

      expect(Number(newReferralBalance)).to.be.closeTo(
        Number.parseFloat(referralBalance) + ETHER / 10,
        ETHER / APPROXIMATELY
      )
    })

    it('should have 1.11% deposit intersest with 0 referrals', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })
      await time.increaseTo(this.startTime + time.duration.days(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        (ETHER * 1.11) / 100,
        ETHER / APPROXIMATELY
      )
    })

    it('should have 2.22% deposit intersest with 1 referrals', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet2,
        data: wallet1
      })

      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })
      await time.increaseTo(this.startTime + time.duration.days(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        (ETHER * 1.11 + ETHER * 2.22) / 100,
        ETHER / APPROXIMATELY
      )
    })

    it('should have 3.33% deposit intersest with 2 referrals', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet2,
        data: wallet1
      })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet3,
        data: wallet1
      })

      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await time.increaseTo(this.startTime + time.duration.days(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        (ETHER * 1.11 + ETHER * 3.33) / 100,
        ETHER / APPROXIMATELY / 10000
      )
    })

    it('should have 4.44% deposit intersest with 3 referrals', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet2,
        data: wallet1
      })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet3,
        data: wallet1
      })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet4,
        data: wallet1
      })

      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })
      await time.increaseTo(this.startTime + time.duration.days(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        (ETHER * 1.11 + ETHER * 4.44) / 100,
        ETHER / (APPROXIMATELY / 10000)
      )
    })

    it('should have 4.44% deposit intersest with 4 referrals', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet2,
        data: wallet1
      })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet3,
        data: wallet1
      })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet4,
        data: wallet1
      })

      await this.contract.sendTransaction({
        value: ether(1),
        from: wallet5,
        data: wallet1
      })

      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await time.increaseTo(this.startTime + time.duration.days(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        (ETHER * 1.11 + ETHER * 4.44) / 100,
        ETHER / (APPROXIMATELY / 10000)
      )
    })
  })

  describe('withdrawal', function() {
    it('should not work without deposit', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet2
      })

      dividends.should.be.bignumber.equal(0)
    })

    it('should work after deposit and 1 day wait', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await time.increaseTo(this.startTime + time.duration.days(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        (ETHER * 1.11) / 100,
        ETHER / APPROXIMATELY
      )
    })

    it('should work after deposit and 1 hour wait', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await time.increaseTo(this.startTime + time.duration.hours(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        ((ETHER / 24) * 1.11) / 100,
        ETHER / APPROXIMATELY
      )
    })

    it('should work after deposit and 1 min wait', async function() {
      await this.contract.sendTransaction({ value: ether(1), from: wallet1 })

      await time.increaseTo(this.startTime + time.duration.minutes(1))

      const dividends = await payEther(this.contract, {
        value: 0,
        from: wallet1
      })

      expect(dividends).to.be.closeTo(
        ((ETHER / (24 * 60)) * 1.11) / 100,
        ETHER / APPROXIMATELY
      )
    })
  })
})
