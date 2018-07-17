# Albos token

## Testing

```sh
$ git clone git@github.com:egorzaremba/EthereumStuff.git
$ cd EthereumStuff/Albos
$ npm install -g truffle
$ truffle test
```

## Token Description

> Name: "ALBOS Token";
> Symbol: "ALB";
> Decimals: 18;
> Total supply: 28,710,000,000 tokens


## Founders Tokens

> Contract "Founders" - it's special contract, which hold tokens for your team wallet(!Make sure that you change address in production contract).
⋅⋅⋅Address teamWallet = 0x11231231231312313123132131231 - !change before deploy in main network!⋅⋅⋅
> Team wallet can return 30% of tokens after 3 month of listing.
> Team wallet can return 65% of tokens after 6 month of listing.
> Team wallet can return 100% of tokens after 9 month of listing.
> Total tokens on this contract is 8,613,000,000 / 30% of total supply.


## Contract Management

Contract has array to collect all address, which can transfer frozen tokens from own balance, this logic for owner and admin addresses and exchanges addresses
Contract has agentAddress - its seems like admin address for do automatic stuff on server side. You can transfer new ownership of admin address to call transferAgent() function
You can add a new address, which can transfer frozen tokens(new exchange maybe) to call addStaff() function


## Time Management

Nobody can transfer tokens before "listing start" except Albos contract
All times calculate in Ethereum blocks to avoid timestamp abuse, 1 block is 14 seconds
Listing variable show current status of listing, after listing you should call startListing() function and after that timer goes up for all freezing tokens(except manually freezing)


## Different tokens conditions

addPrivateSaleTokens - allow owner and admin to transfer tokens from contract to user
addPrivateSaleTokensMulti - allow owner and admin to transfer tokens from contract to users

addPreSaleTokens - allow owner and admin to transfer tokens with presale lock-up from contract to user
addPreSaleTokensMulti - allow owner and admin to transfer tokens with presale lock-up from contract to users
Preasle lock-up means:
After purchase only 10% of tokens can be tranfable
After 1 month of purchase only 40% of tokens can be tranfable
After 2 months of purchase only 70% of tokens can be tranfable
After 3 months of purchase only 100% of tokens can be tranfable

addCrowdSaleTokens - allow owner and admin to transfer tokens with crowdsale lock-up from contract to user
addCrowdSaleTokensMulti - allow owner and admin to transfer tokens with crowdsale lock-up from contract to users
Crowdsale lock-up means:
After purchase only 20% of tokens can be tranfable
After 1 month of purchase only 40% of tokens can be tranfable
After 2 months of purchase only 60% of tokens can be tranfable
After 3 months of purchase only 80% of tokens can be tranfable
After 4 months of purchase only 100% of tokens can be tranfable


## Manually freezing tokens

"totalFreezeTokens" - it's variable which contains number of manually frozenTokens. Total number is 20% of total supply tokens / 5,742,000,000 
"Freezing" variable show current state of freezing, if true - freezing works, if false - no more freezing
Owner can kill freezing by calling killFrost() function
mapping (address => uint256) public freezeTokens - shows block when tokens will be defrosted of specific user
mapping (address => uint256) public freezeTimeBlock - shows freezing tokens of specific user

addFrostTokens - allow owner and admin to freeze tokens from any address
addFrostTokensMulti - allow owner and admin to freeze tokens from any addresses

