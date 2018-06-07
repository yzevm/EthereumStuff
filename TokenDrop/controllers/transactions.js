const Transaction = require('../models/transaction')
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');

let web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/cVQunuq6DRSuk6xPaQSm'));

// helpers
function PrefInt(number, len) {
    if (number.length < len) {
       return (Array(len).join('0') + number).slice(-len);
    }
}

function startSending(tx) {
    return new Promise(resolve => {
        const num16 = 64;
        let conUtilies = ''; // no idea, hex
        let addressString = ''; // string of addresses
        let amountString = ''; // string of tokens amounts

        // 1 = 128 = 80 => 2 = 160 = a0 => 3 = 192 = c0
        if (tx.amounts.length === 1) {
            conUtilies = PrefInt((128).toString(16), num16);
        } else if (tx.amounts.length > 1) {
            conUtilies = PrefInt((160 + (32 * (tx.amounts.length - 1))).toString(16), num16);
        }

        let conUtiliesArr = PrefInt((tx.amounts.length).toString(16), num16); // amount of transfers, hex

        for (var i = 0; i < tx.addresses.length; i++) {
            addressString += PrefInt(tx.addresses[i].slice(2), num16);
            amountString += PrefInt((tx.amounts[i]).toString(16), num16);
        }

        let txParams = conUtilies + conUtiliesArr + addressString + conUtiliesArr + amountString;
        resolve(txParams);
    });
}

function sendToFormRaw(txParams) {
    return new Promise(resolve => {
        const conUtil = '0000000000000000000000000000000000000000000000000000000000000040'; // const no idea
        const conMethod = '0x67243482' // Function: airdrop(address[] recipients, uint256[] values)
        let address = '0x5Ac652E32b8064000a4ab34aF0AE24E4966E309E'; // sender address
        let contractAddress = '0xba04ce0d561ad9a3626b2b80ac753ae955f2af1d'; // contract address

        let dataString = conMethod + conUtil + txParams;

        let rawTx = {
            from: address,
            to: contractAddress,
            //value: web3.toHex(web3.toWei(1 +"", "finney")),
            gas: web3.toHex(1000000), // 1mln
            gasPrice: web3.toHex(61000000000), //21 gwei
            nonce: web3.toHex(web3.eth.getTransactionCount(address)),
            data: dataString
        }
    
        resolve(rawTx);
    });
}

function sendRaw(rawTx) {
    return new Promise(resolve => {
        let key = 'de0e79a051b6d2b1f34c4195e70752d59e7e4f7e55244fa67bcc9cf476141231'; // private key of address
        let privateKey = new Buffer(key, 'hex');
        let transaction = new Tx(rawTx);
        transaction.sign(privateKey);
        let serializedTx = transaction.serialize().toString('hex');
        web3.eth.sendRawTransaction(
            '0x' + serializedTx, function(err, result) {
                if(err) {
                    console.log('error');
                    console.log(err);
                } else {
                    resolve(result);
                }
            }
        )
    });
}




// api
module.exports = {

    // generate token
    getToken: async (req, res, next) => {
        console.log('reserved for JWT');
    },

    // addresses and amounts
    sendTokens: async (req, res, next) => {
        const { addresses, amounts } = req.value.body;

        // check if array has 2 addresses
        if (Object.keys(addresses).length != Object.keys(amounts).length) {
            return res.status(403).json({ error: 'lenght of arrays is not equal'});
        }

        let tx = {
            addresses: req.body.addresses,
            amounts: req.body.amounts
        };

        let txString = await startSending(tx);
        let txFullString = await sendToFormRaw(txString);
        let hash = await sendRaw(txFullString);

        const newTx = new Transaction({ addresses, amounts, hash });
        await newTx.save();
        
        res.status(200).json({ txHash: `https://ropsten.etherscan.io/tx/${hash}` })
    },

    txAll: async (req, res, next) => {
        Transaction.find({}, function(err, txes) {
            var txMap = {};
        
            txes.forEach(function(tx, i) {
                txMap[i] = tx;
            });
        
            res.status(200).json(txMap);  
        });
    },

    txHash: async (req, res, next) => {
        Transaction.find({}, function(err, txes) {
            var txMap = {};
        
            txes.forEach(function(tx, i) {
                if (tx.hash === req.params.id) {
                    txMap[i] = tx;
                }
            });
        
            res.status(200).json(txMap);  
        });
    },

    txAddress: async (req, res, next) => {
        Transaction.find({}, function(err, txes) {
            var txMap = {};
        
            txes.forEach(function(tx, i) {
                tx.addresses.forEach(function(address) {
                    if (address === req.params.id) {
                        txMap[i] = tx;
                    }
                })  
            })
        
            res.status(200).json(txMap);  
        });
    }
}