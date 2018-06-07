# Setup

  - nodejs
  - mongodb
```sh
  $ npm install
  $ node index.js
```
  - port 3000

# API methods

POST
  - localhost:3000/api/sendTokens
  - request (max 50 items in array, also do second request after confirmation of first transaction, otherwise 2nd tx will block 1st tx)
```sh
{
  "addresses": [
    "0x11bc92df3209f2b51afb5efe333748d3a662a753",
    "0x69bc92df3209f2b51afb5efed63748d3a662a753"
  ],
  "amounts": [
    11,
    99999
  ]
}
```
  - respond
```sh
{
  "txHash": "https://ropsten.etherscan.io/tx/0xe7b05537909c31696399d47f82962e8f2dc3d079c2c559340e07e9b8d49e197b"
}
```

  
GET

```sh
localhost:3000/api/tx/all
```
return all transaction

```sh
localhost:3000/api/tx/hash/0xe7b05537909c31696399d47f82962e8f2dc3d079c2c559340e07e9b8d49e197b
```
return transaction info by hash

```sh
localhost:3000/api/tx/address/0x5Ac652E32b8064000a4ab34aF0AE24E4966E309E
```
return all transactions by address

# Coming soon
  - JWT
  - any ideas for security will be listened