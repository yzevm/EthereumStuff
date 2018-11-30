# Lottery

#### Testing

```sh
$ git clone git@github.com:egorzaremba/EthereumStuff.git
$ cd EthereumStuff/lottery
$ npm install
$ npm install testrpc
$ testrpc
$ truffle test
```

#### Deposits

Minimum deposit amount = 0.1 ETH.

Deposits are separate. Each deposit has own time, amount and interest.

Interest system:

1. user has 0 referrals = 1.11%
2. user has 1 referrals = 2.22%
3. user has 2 referrals = 3.33%
4. user has 3 or more referrals = 4.44%

10 % of each deposit goes to marketing and team wallet, which is hard coded (need to change before deploy).

Maximum amount of active deposits is 50. Users cannot execute more than 50. Avoiding `out of gas` error.

#### Referral system

Its optional feature.

When user sends deposit, he can add referrer address, where referrer address gets 10% of user deposit amount. Also I added some checkers to avoid cheating.

#### Withdrawals

User can get withdrawals sending any amount of ETH to contract. Withdrawal of each deposit will be sent to user via single transaction.

Maximum time is 50 days. It means that interests works only 50 days.
In tech assigment you write about max 250% of deposit. Its how I plan to realize it. **Need to discuss.**

If contract balance is less than user withdrawals amount(when it is processing), user gets all contract balance and contract start new round/wave/reset immediately.

#### Owner

Onwer address can change interest percents by calling changeInterest() method. Owner address is hard coded (need to change before deploy).
