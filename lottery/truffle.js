module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 3000000,
      gasPrice: 2 // web3.eth.gasPrice
    }
  }
}
