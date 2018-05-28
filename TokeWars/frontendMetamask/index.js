"use strict";

let eventHandlerPageLoad = function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    document.getElementById('intervalErrorMessage').innerText = "No Ethereum node found";
  }

  // Immediately execute methods after web page is loaded
  startApp();
}

function startApp(){
  monitorAccountChanges();
  dataChanges();
  watchSyncing();
  reloadPageWhenNoNetwork();
}

window.addEventListener('load', eventHandlerPageLoad);

// Check if an Ethereum node is available every 5 seconds.
function reloadPageWhenNoNetwork(){
  setInterval(function(){
    if(!web3.isConnected()){
      // If an Ethereum node is found, reload web page.
      eventHandlerPageLoad();
    }
  }, 5000);
}

// Everytime a sync starts, updates and stops.
function watchSyncing(){
  web3.eth.isSyncing(function(err, sync){
    if(!err) {
      // stop all app activity
      if(sync === true) {
       // we use `true`, so it stops all filters, but not the web3.eth.syncing polling
       web3.reset(true);
      } else if(sync) {
        // Show sync info. When your Ethereum node is not runnning for a day, your node need to be synchronized.
        // A message will be displayed on top of screen.
       document.getElementById('intervalErrorMessage').innerText = "Syncing from "+sync.currentBlock+" to "+sync.highestBlock;
      } else {
        // re-gain app operation
        startApp();
      }
    }
  });
}

function monitorAccountChanges() {
  // Declare accountInterval here. Clear the variable if there is no Ethereum node found.
  let accountInterval;

  // Check if an Ethereum node is found.
  if(web3.isConnected()){

    // If a coinbase account is found, automatically update the fromAddress form field with the coinbase account
    getCoinbasePromise().then(function(fromAddress){
      document.getElementById('fromAddress').value = fromAddress;
    }).catch(function(err){
      document.getElementById('intervalErrorMessage').innerText = err;
    });

    let account = web3.eth.accounts[0];

    // At a time interval of 1 sec monitor account changes
    accountInterval = setInterval(function() {

      // Monitor account changes. If you switch account, for example in MetaMask, it will detect this.
      if (web3.eth.accounts[0] !== account) {
        account = web3.eth.accounts[0];
        document.getElementById('fromAddress').value = account;
      } else {
        document.getElementById('intervalErrorMessage').innerText = "No accounts found";
      }
      if(account != null) {
        document.getElementById('intervalErrorMessage').innerText= "";
      }

      // Check which Ethereum network is used
      getNetworkPromise().then(function(network){
        document.getElementById('network').innerText = "Network: " + network + "\n";
      }).catch(function(err){
        document.getElementById('result').innerText = "Not a valid "+res+".";
      });

    }, 1000); // end of accountInterval = setInterval(function()

  } else {
    // Stop the accountInterval
    clearInterval(accountInterval);
    document.getElementById('intervalErrorMessage').innerText = "No Ethereum node found";
  }
}

function createContract(){
  const contractSpec = web3.eth.contract(
    [  {   "constant": true,   "inputs": [    {     "name": "",     "type": "uint256"    }   ],   "name": "cooldowns",   "outputs": [    {     "name": "",     "type": "uint32"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "secondsPerBlock",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "saleAuction",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "promoCreatedCount",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "pregnantKitties",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_owner",     "type": "address"    }   ],   "name": "balanceOf",   "outputs": [    {     "name": "count",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "ownerOf",   "outputs": [    {     "name": "owner",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "betLevel",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "name",   "outputs": [    {     "name": "",     "type": "string"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "",     "type": "uint256"    }   ],   "name": "kittyIndexToOwner",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "",     "type": "uint256"    }   ],   "name": "kittyIndexToApproved",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "autoBirthFee",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_kittyId",     "type": "uint256"    }   ],   "name": "isReadyToBreed",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "PROMO_CREATION_LIMIT",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_kittyId",     "type": "uint256"    }   ],   "name": "isPregnant",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "GEN0_STARTING_PRICE",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "boosterFee",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "",     "type": "uint256"    }   ],   "name": "sireAllowedToAddress",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_id",     "type": "uint256"    }   ],   "name": "getKitty",   "outputs": [    {     "name": "isGestating",     "type": "bool"    },    {     "name": "isReady",     "type": "bool"    },    {     "name": "cooldownIndex",     "type": "uint256"    },    {     "name": "nextActionAt",     "type": "uint256"    },    {     "name": "siringWithId",     "type": "uint256"    },    {     "name": "birthTime",     "type": "uint256"    },    {     "name": "matronId",     "type": "uint256"    },    {     "name": "sireId",     "type": "uint256"    },    {     "name": "generation",     "type": "uint256"    },    {     "name": "level",     "type": "uint256"    },    {     "name": "winCount",     "type": "uint256"    },    {     "name": "genes",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "siringAuction",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "gen0CreatedCount",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "",     "type": "uint256"    }   ],   "name": "strength",   "outputs": [    {     "name": "",     "type": "uint32"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "fightingAuction",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "symbol",   "outputs": [    {     "name": "",     "type": "string"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_matronId",     "type": "uint256"    },    {     "name": "_sireId",     "type": "uint256"    }   ],   "name": "canBreedWith",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "GEN0_CREATION_LIMIT",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "ceoAddress",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_owner",     "type": "address"    }   ],   "name": "tokensOfOwner",   "outputs": [    {     "name": "ownerTokens",     "type": "uint256[]"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "cfoAddress",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "totalSupply",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "cooAddress",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "GEN0_AUCTION_DURATION",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "paused",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_kittyId",     "type": "uint256"    },    {     "name": "_startingPrice",     "type": "uint256"    },    {     "name": "_endingPrice",     "type": "uint256"    },    {     "name": "_duration",     "type": "uint256"    }   ],   "name": "createSiringAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "inputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "constructor"  },  {   "constant": false,   "inputs": [    {     "name": "_addr",     "type": "address"    },    {     "name": "_sireId",     "type": "uint256"    }   ],   "name": "approveSiring",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [],   "name": "withdrawBalance",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_to",     "type": "address"    },    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "approve",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_kittyId",     "type": "uint256"    },    {     "name": "_startingPrice",     "type": "uint256"    },    {     "name": "_endingPrice",     "type": "uint256"    },    {     "name": "_duration",     "type": "uint256"    }   ],   "name": "createFightingAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "anonymous": false,   "inputs": [    {     "indexed": false,     "name": "from",     "type": "address"    },    {     "indexed": false,     "name": "to",     "type": "address"    },    {     "indexed": false,     "name": "tokenId",     "type": "uint256"    }   ],   "name": "Transfer",   "type": "event"  },  {   "constant": false,   "inputs": [    {     "name": "_genes",     "type": "uint256"    },    {     "name": "_owner",     "type": "address"    }   ],   "name": "createPromoKitty",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "anonymous": false,   "inputs": [    {     "indexed": false,     "name": "owner",     "type": "address"    },    {     "indexed": false,     "name": "matronId",     "type": "uint256"    },    {     "indexed": false,     "name": "sireId",     "type": "uint256"    },    {     "indexed": false,     "name": "cooldownEndBlock",     "type": "uint256"    }   ],   "name": "Pregnant",   "type": "event"  },  {   "constant": false,   "inputs": [    {     "name": "_from",     "type": "address"    },    {     "name": "_to",     "type": "address"    },    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "transferFrom",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_address",     "type": "address"    }   ],   "name": "setSaleAuctionAddress",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_matronId",     "type": "uint256"    }   ],   "name": "giveBirth",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_address",     "type": "address"    }   ],   "name": "setSiringAuctionAddress",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_sireId",     "type": "uint256"    },    {     "name": "_matronId",     "type": "uint256"    }   ],   "name": "bidOnFightingAuction",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_kittyId",     "type": "uint256"    }   ],   "name": "takeBooster",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "val",     "type": "uint256"    }   ],   "name": "setAutoBirthFee",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "payable": true,   "stateMutability": "payable",   "type": "fallback"  },  {   "constant": false,   "inputs": [    {     "name": "_genes",     "type": "uint256"    }   ],   "name": "createGen0Auction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_matronId",     "type": "uint256"    },    {     "name": "_sireId",     "type": "uint256"    }   ],   "name": "breedWithAuto",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "anonymous": false,   "inputs": [    {     "indexed": false,     "name": "owner",     "type": "address"    },    {     "indexed": false,     "name": "approved",     "type": "address"    },    {     "indexed": false,     "name": "tokenId",     "type": "uint256"    }   ],   "name": "Approval",   "type": "event"  },  {   "anonymous": false,   "inputs": [    {     "indexed": false,     "name": "owner",     "type": "address"    },    {     "indexed": false,     "name": "kittyId",     "type": "uint256"    },    {     "indexed": false,     "name": "matronId",     "type": "uint256"    },    {     "indexed": false,     "name": "sireId",     "type": "uint256"    },    {     "indexed": false,     "name": "genes",     "type": "uint256"    }   ],   "name": "Birth",   "type": "event"  },  {   "anonymous": false,   "inputs": [    {     "indexed": false,     "name": "newContract",     "type": "address"    }   ],   "name": "ContractUpgrade",   "type": "event"  },  {   "constant": false,   "inputs": [    {     "name": "_to",     "type": "address"    },    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "transfer",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_sireId",     "type": "uint256"    },    {     "name": "_matronId",     "type": "uint256"    }   ],   "name": "bidOnSiringAuction",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_kittyId",     "type": "uint256"    },    {     "name": "_startingPrice",     "type": "uint256"    },    {     "name": "_endingPrice",     "type": "uint256"    },    {     "name": "_duration",     "type": "uint256"    }   ],   "name": "createSaleAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_address",     "type": "address"    }   ],   "name": "setFightinigAuctionAddress",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_newStrength",     "type": "uint32[10]"    }   ],   "name": "newStrength",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  } ]
  );

  return contractSpec.at(document.getElementById('contractAddress').value);
}

function createSaleContract() {
  const contractSpec = web3.eth.contract(
    [  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "getAuction",   "outputs": [    {     "name": "seller",     "type": "address"    },    {     "name": "startingPrice",     "type": "uint256"    },    {     "name": "endingPrice",     "type": "uint256"    },    {     "name": "duration",     "type": "uint256"    },    {     "name": "startedAt",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "paused",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "averageGen0SalePrice",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "ownerCut",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "owner",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "nonFungibleContract",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "",     "type": "uint256"    }   ],   "name": "lastGen0SalePrices",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "isSaleClockAuction",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "getCurrentPrice",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "gen0SaleCount",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "anonymous": false,   "inputs": [],   "name": "Pause",   "type": "event"  },  {   "constant": false,   "inputs": [],   "name": "withdrawBalance",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "anonymous": false,   "inputs": [],   "name": "Unpause",   "type": "event"  },  {   "constant": false,   "inputs": [],   "name": "pause",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "bid",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "cancelAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "inputs": [    {     "name": "_nftAddr",     "type": "address"    },    {     "name": "_cut",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "constructor"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "cancelAuctionWhenPaused",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    },    {     "name": "_startingPrice",     "type": "uint256"    },    {     "name": "_endingPrice",     "type": "uint256"    },    {     "name": "_duration",     "type": "uint256"    },    {     "name": "_seller",     "type": "address"    }   ],   "name": "createAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [],   "name": "unpause",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  } ]
  );

  return contractSpec.at(document.getElementById('saleContractAddress').value);
}

function createSireContract() {
  const contractSpec = web3.eth.contract(
    [  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "getCurrentPrice",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "paused",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "getAuction",   "outputs": [    {     "name": "seller",     "type": "address"    },    {     "name": "startingPrice",     "type": "uint256"    },    {     "name": "endingPrice",     "type": "uint256"    },    {     "name": "duration",     "type": "uint256"    },    {     "name": "startedAt",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "ownerCut",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "owner",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "nonFungibleContract",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "isSiringClockAuction",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "anonymous": false,   "inputs": [],   "name": "Pause",   "type": "event"  },  {   "constant": false,   "inputs": [],   "name": "withdrawBalance",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "anonymous": false,   "inputs": [],   "name": "Unpause",   "type": "event"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "bid",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "cancelAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "cancelAuctionWhenPaused",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "inputs": [    {     "name": "_nftAddr",     "type": "address"    },    {     "name": "_cut",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "constructor"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    },    {     "name": "_startingPrice",     "type": "uint256"    },    {     "name": "_endingPrice",     "type": "uint256"    },    {     "name": "_duration",     "type": "uint256"    },    {     "name": "_seller",     "type": "address"    }   ],   "name": "createAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [],   "name": "pause",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [],   "name": "unpause",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  } ]
  );

  return contractSpec.at(document.getElementById('sireContractAddress').value);
}

function createFightContract() {
  const contractSpec = web3.eth.contract(
    [  {   "constant": true,   "inputs": [],   "name": "paused",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "getAuction",   "outputs": [    {     "name": "seller",     "type": "address"    },    {     "name": "startingPrice",     "type": "uint256"    },    {     "name": "endingPrice",     "type": "uint256"    },    {     "name": "duration",     "type": "uint256"    },    {     "name": "startedAt",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "ownerCut",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "owner",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "nonFungibleContract",   "outputs": [    {     "name": "",     "type": "address"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [],   "name": "isFightingClockAuction",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "constant": true,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "getCurrentPrice",   "outputs": [    {     "name": "",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "view",   "type": "function"  },  {   "inputs": [    {     "name": "_nftAddr",     "type": "address"    },    {     "name": "_cut",     "type": "uint256"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "constructor"  },  {   "anonymous": false,   "inputs": [],   "name": "Pause",   "type": "event"  },  {   "constant": false,   "inputs": [],   "name": "withdrawBalance",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "anonymous": false,   "inputs": [],   "name": "Unpause",   "type": "event"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "bid",   "outputs": [],   "payable": true,   "stateMutability": "payable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "cancelAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    }   ],   "name": "cancelAuctionWhenPaused",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [    {     "name": "_tokenId",     "type": "uint256"    },    {     "name": "_startingPrice",     "type": "uint256"    },    {     "name": "_endingPrice",     "type": "uint256"    },    {     "name": "_duration",     "type": "uint256"    },    {     "name": "_seller",     "type": "address"    }   ],   "name": "createAuction",   "outputs": [],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [],   "name": "pause",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  },  {   "constant": false,   "inputs": [],   "name": "unpause",   "outputs": [    {     "name": "",     "type": "bool"    }   ],   "payable": false,   "stateMutability": "nonpayable",   "type": "function"  } ]
  );

  return contractSpec.at(document.getElementById('fightContractAddress').value);
}













// ===================================================
// Promises
// ===================================================

const getCoinbasePromise = function(){
  return new Promise(function(resolve, reject){
    web3.eth.getCoinbase(function(err, res){
      if (!res) {
        reject("No accounts found");
      } else {
        resolve(res);
      }
    });
  });
}

const checkAddressPromise = function(address, addressType) {
  return new Promise(function(resolve, reject){
    if (address != null && web3.isAddress(address)) {
      resolve();
    } else {
      reject(addressType);
    }
  });
}


const birthFee = 2000000000000000;
const boosterFee = 3000000000000000;
const gasFee = 350000;

// done
const getPriceOnSellingAuctionPromise = function(bidSelling) {
  return new Promise(function(resolve, reject) {
    const contract = createSaleContract();
    contract.getCurrentPrice(bidSelling, function (err, sellingActionPrice) {

      if(sellingActionPrice) {
        resolve(sellingActionPrice);
      } else {
        reject("getPriceOnSellingAuctionPromise: " +err);
      }
    });
  });
}

const bidOnSellingAuctionPromise = function(fromAddress, bidSelling, sellingActionPrice) {
  return new Promise(function(reject) {
    const contract = createSaleContract();
    let sellingActionPriceNumber = sellingActionPrice.toNumber();
    let multipliePrice = sellingActionPriceNumber * 1.1; // for sure
    contract.bid(bidSelling, {from: fromAddress, value: multipliePrice, gas: gasFee}, function (err) {
      reject("bidOnSellingAuctionPromise: " +err);
    });
  });
}
//done

// done
const getPriceOnSiringAuctionPromise = function(bidSiringEnemy) {
  return new Promise(function(resolve, reject) {
    const contract = createSireContract();
    contract.getCurrentPrice(bidSiringEnemy, function (err, siringActionPrice) {

      if(siringActionPrice) {
        resolve(siringActionPrice);
      } else {
        reject("getPriceOnSiringAuctionPromise: " +err);
      }
    });
  });
}

const bidOnSiringAuctionPromise = function(fromAddress, bidSiringEnemy, bidSiring, siringActionPrice) {
  return new Promise(function(reject) {
    const contract = createContract();
    let siringActionPriceNumber = siringActionPrice.toNumber();
    let multipliePrice = siringActionPriceNumber * 1.1; // for sure
    let totalPrice = multipliePrice + birthFee;
    contract.bidOnSiringAuction(bidSiringEnemy, bidSiring, {from: fromAddress, value: totalPrice, gas: gasFee}, function (err) {
      reject("bidOnSiringAuctionPromise: " +err);
    });
  });
}
// done

// done
const getPriceOnFightingAuctionPromise = function(bidFightingEnemy) {
  return new Promise(function(resolve, reject) {
    const contract = createFightContract();
    contract.getCurrentPrice(bidFightingEnemy, function (err, fightingActionPrice) {

      if(fightingActionPrice) {
        resolve(fightingActionPrice);
      } else {
        reject("getPriceOnFightingAuctionPromise: " +err);
      }
    });
  });
}

const bidOnFightingAuctionPromise = function(fromAddress, bidFightingEnemy, bidFighting, fightingActionPrice) {
  return new Promise(function(reject){
    const contract = createContract();
    let fightingActionPriceNumber = fightingActionPrice.toNumber();
    let multipliePrice = fightingActionPriceNumber * 1.1; // for sure
    let totalPrice = multipliePrice + birthFee;
    contract.bidOnFightingAuction(bidFightingEnemy, bidFighting, {from: fromAddress, value: totalPrice, gas: gasFee}, function (err) {
      reject("bidOnFightingAuctionPromise: " +err);
    });
  });
}
// done

const createSaleAuctionPromise = function(fromAddress, sellingActId, sellingActStart, sellingActEnd, sellingActDuration) {
  return new Promise(function(reject) {
    // Convert from ether to wei
    const sellingActStartWei = web3.toWei(sellingActStart, 'ether');
    const sellingActEndWei = web3.toWei(sellingActEnd, 'ether');
    const contract = createContract();
    contract.createSaleAuction(sellingActId, sellingActStartWei, sellingActEndWei, sellingActDuration, {from: fromAddress}, function (err) {
      reject("createSaleAuctionPromise: " +err);
    });
  });
}

const createSiringAuctionPromise = function(fromAddress, siringActId, siringActStart, siringActEnd, siringActDuration) {
  return new Promise(function(reject) {
    // Convert from ether to wei
    const siringActStartWei = web3.toWei(siringActStart, 'ether');
    const siringActEndWei = web3.toWei(siringActEnd, 'ether');
    const contract = createContract();
    contract.createSiringAuction(siringActId, siringActStartWei, siringActEndWei, siringActDuration, {from: fromAddress}, function (err) {
      reject("createSiringAuctionPromise: " +err);
    });
  });
}

const createFightingAuctionPromise = function(fromAddress, fightingActId, fightingActStart, fightingActEnd, fightingActDuration) {
  return new Promise(function(reject) {
    // Convert from ether to wei
    const fightingActStartWei = web3.toWei(fightingActStart, 'ether');
    const fightingActEndWei = web3.toWei(fightingActEnd, 'ether');
    const contract = createContract();
    contract.createFightingAuction(fightingActId, fightingActStartWei, fightingActEndWei, fightingActDuration, {from: fromAddress}, function (err) {
      reject("createFightingAuctionPromise: " +err);
    });
  });
}

const takeBoosterPromise = function(fromAddress, takeBooster) {
  return new Promise(function(reject) {
    const contract = createContract();
    contract.takeBooster(takeBooster, {from: fromAddress, value: boosterFee, gas: gasFee}, function (err) {
      reject("takeBoosterPromise: " +err);
    });
  });
}

const giveBirthPromise = function(fromAddress, giveBirthInput) {
  return new Promise(function(reject) {
    const contract = createContract();
    contract.giveBirth(giveBirthInput, {from: fromAddress, gas: gasFee}, function (err) {
      reject("giveBirthPromise: " +err);
    });
  });
}

const getNetworkPromise = function() {
  return new Promise(function(resolve, reject){
    // Check which Ethereum network is used
    web3.version.getNetwork(function(err, res){
      let selectedNetwork = "";

      if (!err) {
        if(res > 1000000000000) {
          // I am not sure about this. I maybe wrong!
          selectedNetwork = "Testrpc";
        } else {
          switch (res) {
            case "1":
              selectedNetwork = "Mainnet";
              break
            case "2":
              selectedNetwork = "Morden";
              break
            case "3":
              selectedNetwork = "Ropsten";
              break
            case "4":
              selectedNetwork = "Rinkeby";
              break
            default:
              selectedNetwork = "Unknown network = "+res;
          }
        }
        resolve(selectedNetwork);
      } else {
        reject("getBlockTransactionCountPromise: "+err);
      }
    });
  });
}








// ===================================================
// Helper functions
// ===================================================

function storeData(clickedId){
  // Check if an Ethereum node is found.
  if(web3.isConnected()){
    document.getElementById('result').innerText = "";

    const contractAddress = document.getElementById('contractAddress').value;
    const saleContractAddress = document.getElementById('saleContractAddress').value;
    const fromAddress = document.getElementById('fromAddress').value;

    // real actions in contract
    const bidSelling = document.getElementById('bidSelling').value;
    const bidSiringEnemy = document.getElementById('bidSiringEnemy').value;
    const bidSiring = document.getElementById('bidSiring').value;
    const bidFightingEnemy = document.getElementById('bidFightingEnemy').value;
    const bidFighting = document.getElementById('bidFighting').value;
    const sellingActId = document.getElementById('sellingActId').value;
    const sellingActStart = document.getElementById('sellingActStart').value;
    const sellingActEnd = document.getElementById('sellingActEnd').value;
    const sellingActDuration = document.getElementById('sellingActDuration').value;
    const siringActId = document.getElementById('siringActId').value;
    const siringActStart = document.getElementById('siringActStart').value;
    const siringActEnd = document.getElementById('siringActEnd').value;
    const siringActDuration = document.getElementById('siringActDuration').value;
    const fightingActId = document.getElementById('fightingActId').value;
    const fightingActStart = document.getElementById('fightingActStart').value;
    const fightingActEnd = document.getElementById('fightingActEnd').value;
    const fightingActDuration = document.getElementById('fightingActDuration').value;
    const takeBooster = document.getElementById('takeBooster').value;
    const giveBirthInput = document.getElementById('giveBirthInput').value;


    // Check if contractAddress and fromAddress are valid, if so continue.
    checkAddressPromise(contractAddress, "contract address")
    .then(function() {
      return checkAddressPromise(saleContractAddress, "sale contract address")
    }).then(function() {
      return checkAddressPromise(fromAddress, "from account")
    }).then(function() {

      // real actions in contract
      if(clickedId == "bidSelling"){
        bidOnSellingAuction(fromAddress, bidSelling);
      } 
      else if(clickedId == "bidSiring"){
        bidOnSiringAuction(fromAddress, bidSiringEnemy, bidSiring);
      } 
      else if(clickedId == "bidFighting"){
        bidOnFightingAuction(fromAddress, bidFightingEnemy, bidFighting);
      }
      else if(clickedId == "actionSellingBtn"){
        createSaleAuction(fromAddress, sellingActId, sellingActStart, sellingActEnd, sellingActDuration);
      } 
      else if(clickedId == "actionSiringBtn"){
        createSiringAuction(fromAddress, siringActId, siringActStart, siringActEnd, siringActDuration);
      } 
      else if(clickedId == "actionFightingBtn"){
        createFightingAuction(fromAddress, fightingActId, fightingActStart, fightingActEnd, fightingActDuration);
      } 
      else if(clickedId == "boosterTakeBtn"){
        takeBoosterFunction(fromAddress, takeBooster);
      }
      else if(clickedId == "giveBirthBtn"){
        giveBirthFunction(fromAddress, giveBirthInput);
      }

    }).catch(function(message){
      document.getElementById('result').innerText = "Not a valid "+message+".";
    });

  } else {
    document.getElementById('intervalErrorMessage').innerText = "No Ethereum node found";
  }
}

function totalSupply(err, res) {
  if(res) {
    document.getElementById('totalSupply').innerText = "Total characters supply "+res;
  } else {
    alert("totalSupply: "+err);
  }
}

function userKitties(err, res, contract, fromAddress, saleContractAddress, sireContractAddress, fightContractAddress) {
  if(res) {

    let totalAmount = res.toNumber();
    let kittiesArray = [];
    let sellingArray = [];
    let siringArray = [];
    let fightingArray = [];

    for (let i = 0; i <= totalAmount; i++) {
      contract.ownerOf(i, function (err, res) {
        if (res == fromAddress) {
          kittiesArray.push(" "+i);
          document.getElementById('userKitties').innerText = "Your kitties indexes "+kittiesArray;
        }
        if (res == saleContractAddress) {
          sellingArray.push(" "+i);
          document.getElementById('sellingKitties').innerText = "Selling Kitties "+sellingArray;
        }
        if (res == sireContractAddress) {
          siringArray.push(" "+i);
          document.getElementById('siringKitties').innerText = "Siring Kitties "+siringArray;
        }
        if (res == fightContractAddress) {
          fightingArray.push(" "+i);
          document.getElementById('fightingKitties').innerText = "Fighting Kitties "+fightingArray;
        }
      });
    }
  } else {
    alert("userKitties: "+err);
  }
}










function balanceOf(err, res) {
  if(res) {
    document.getElementById('balanceOf').innerText = "You have "+res+" characters";
  } else {
    alert("balanceOf: "+err);
  }
}

function ownerOf(err, res) {
  if(res) {
    document.getElementById('ownerOf').innerText = "Character's owner is "+res;
  } else {
    alert("ownerOf: "+err);
  }
}

function getKitty(err, res) {
  if(res) {
    document.getElementById('getKittyIsGestating').innerText = "IsGestating (Pregnant) "+res[0];
    document.getElementById('getKittyIsReady').innerText = "IsReady "+res[1];
    document.getElementById('getKittyCooldownIndex').innerText = "CooldownIndex "+res[2];
    document.getElementById('getKittyNextActionAt').innerText = "NextActionAt "+res[3];
    document.getElementById('getKittySiringWithId').innerText = "SiringWithId "+res[4];
    document.getElementById('getKittyBirthTime').innerText = "BirthTime "+res[5];
    document.getElementById('getKittyMatronId').innerText = "MatronId "+res[6];
    document.getElementById('getKittySireId').innerText = "SireId "+res[7];
    document.getElementById('getKittyGeneration').innerText = "Generation "+res[8];
    document.getElementById('getKittyLevel').innerText = "Level "+res[9];
    document.getElementById('getKittyWinCount').innerText = "WinCount "+res[10];
    document.getElementById('getKittyGenes').innerText = "Genes "+res[11];
  } else {
    alert("getKitty: "+err);
  }
}

function getSaleAction(err, res) {
  if(res) {
    document.getElementById('getSellActionOwner').innerText = "Owner "+res[0];
    document.getElementById('getSellActionStart').innerText = "Start price in wei  "+res[1];
    document.getElementById('getSellActionEnd').innerText = "End price in wei "+res[2];
    document.getElementById('getSellActionDuration').innerText = "Duration "+res[3];
  } else {
    alert("getSaleAction: "+err);
  }
}

function getSireAction(err, res) {
  if(res) {
    document.getElementById('getSireActionOwner').innerText = "Owner "+res[0];
    document.getElementById('getSireActionStart').innerText = "Start price in wei  "+res[1];
    document.getElementById('getSireActionEnd').innerText = "End price in wei "+res[2];
    document.getElementById('getSireActionDuration').innerText = "Duration "+res[3];
  } else {
    alert("getSireAction: "+err);
  }
}

function getFightAction(err, res) {
  if(res) {
    document.getElementById('getFightActionOwner').innerText = "Owner "+res[0];
    document.getElementById('getFightActionStart').innerText = "Start price in wei  "+res[1];
    document.getElementById('getFightActionEnd').innerText = "End price in wei "+res[2];
    document.getElementById('getFightActionDuration').innerText = "Duration "+res[3];
  } else {
    alert("getFightAction: "+err);
  }
}











// ===================================================
// Calling CoreWars.sol functions
// ===================================================


function dataChanges() {
  // Declare accountInterval here. Clear the variable if there is no Ethereum node found.
  let dataInterval;

    // Check if Ethereum node is found
  if(web3.isConnected()){

    dataInterval = setInterval(function() {
      //clearOutputs();

      const contractAddress = document.getElementById('contractAddress').value;
      const saleContractAddress = document.getElementById('saleContractAddress').value;
      const sireContractAddress = document.getElementById('sireContractAddress').value;
      const fightContractAddress = document.getElementById('fightContractAddress').value;
      const fromAddress = document.getElementById('fromAddress').value;

      // Promise chain
      checkAddressPromise(contractAddress, "contract address").then(function(){
        const contract = createContract();

          contract.totalSupply(function (err, res) {
            totalSupply(err, res);
            userKitties(err, res, contract, fromAddress, saleContractAddress, sireContractAddress, fightContractAddress);
            // sellingMarket(err, res, contract, saleContractAddress);
            // siringMarket(err, res, contract, sireContractAddress);
            // fightingMarket(err, res, contract, fightContractAddress);
          });

          contract.balanceOf(fromAddress, function (err, res) {
            balanceOf(err, res);
          });

      }).catch(function(message){
        alert("Not a valid "+message+".");
      });

    }, 5000);

  } else {
    // Stop the accountInterval
    clearInterval(accountInterval);
    document.getElementById('intervalErrorMessage').innerText = "No Ethereum node found";
  }
}

function getData(clickedId) {
  // Check if Ethereum node is found
  if(web3.isConnected()) {

    const contractAddress = document.getElementById('contractAddress').value;
    const saleContractAddress = document.getElementById('saleContractAddress').value;
    const sireContractAddress = document.getElementById('sireContractAddress').value;
    const fightContractAddress = document.getElementById('fightContractAddress').value;
    const fromAddress = document.getElementById('fromAddress').value;

    // just info view actions in contract
    const actSellingInput = document.getElementById('actSellingInput').value;
    const actSiringInput = document.getElementById('actSiringInput').value;
    const actFightingInput = document.getElementById('actFightingInput').value;
    const ownerOfInput = document.getElementById('ownerOfInput').value;
    const getKittyInput = document.getElementById('getKittyInput').value;

    // Promise chain for Sale
    checkAddressPromise(contractAddress, "contract address").then(function(){

      const contract = createContract();

      if (clickedId == "ownerOfBtn") {
        contract.ownerOf(ownerOfInput, function (err, res) {
          ownerOf(err, res);
        });
      } 

      else if (clickedId == "getKittyBtn") {
        contract.getKitty(getKittyInput, function (err, res) {
          getKitty(err, res);
        });
      }

    }).catch(function(message){
      document.getElementById('result').innerText = "Not a valid "+message+".";
    });

    // Promise chain for Sale
    checkAddressPromise(saleContractAddress, "sell contract address").then(function(){
      const contract = createSaleContract();

      if (clickedId == "actSelling") {
        contract.getAuction(actSellingInput, function (err, res) {
          getSaleAction(err, res);
        });
      }

    }).catch(function(message){
      document.getElementById('result').innerText = "Not a valid "+message+".";
    });


    // Promise chain for Sire
    checkAddressPromise(sireContractAddress, "sire contract address").then(function(){
      const contract = createSireContract();

      if (clickedId == "actSiring") {
        contract.getAuction(actSiringInput, function (err, res) {
          getSireAction(err, res);
        });
      }

    }).catch(function(message){
      document.getElementById('result').innerText = "Not a valid "+message+".";
    });


    // Promise chain for Fight
    checkAddressPromise(fightContractAddress, "fight contract address").then(function(){
      const contract = createFightContract();

      if (clickedId == "actFighting") {
        contract.getAuction(actFightingInput, function (err, res) {
          getFightAction(err, res);
        });
      }

    }).catch(function(message){
      document.getElementById('result').innerText = "Not a valid "+message+".";
    });

  } else {
    document.getElementById('intervalErrorMessage').innerText = "No Ethereum node found";
  }
}

function bidOnSellingAuction(fromAddress, bidSelling) {
  getPriceOnSellingAuctionPromise(bidSelling).then(function(sellingActionPrice){
    return bidOnSellingAuctionPromise(fromAddress, bidSelling, sellingActionPrice)
  }).catch(function(err) {
    alert("Error: " +err);
  });
}

function bidOnSiringAuction(fromAddress, bidSiringEnemy, bidSiring) {
  getPriceOnSiringAuctionPromise(bidSiringEnemy).then(function(siringActionPrice) {
    return bidOnSiringAuctionPromise(fromAddress, bidSiringEnemy, bidSiring, siringActionPrice)
  }).catch(function(err) {
    alert("Error: " +err);
  });
}

function bidOnFightingAuction(fromAddress, bidFightingEnemy, bidFighting) {
  getPriceOnFightingAuctionPromise(bidFightingEnemy).then(function(fightingActionPrice) {
    return bidOnFightingAuctionPromise(fromAddress, bidFightingEnemy, bidFighting, fightingActionPrice)
  }).catch(function(err) {
    alert("Error: " +err);
  });
}

function createSaleAuction(fromAddress, sellingActId, sellingActStart, sellingActEnd, sellingActDuration) {
  createSaleAuctionPromise(fromAddress, sellingActId, sellingActStart, sellingActEnd, sellingActDuration).catch(function(err) {
    alert("Error: " +err);
  });
}

function createSiringAuction(fromAddress, siringActId, siringActStart, siringActEnd, siringActDuration) {
  createSiringAuctionPromise(fromAddress, siringActId, siringActStart, siringActEnd, siringActDuration).catch(function(err) {
      alert("Error: " +err);
  });
}

function createFightingAuction(fromAddress, fightingActId, fightingActStart, fightingActEnd, fightingActDuration) {
  createFightingAuctionPromise(fromAddress, fightingActId, fightingActStart, fightingActEnd, fightingActDuration).catch(function(err) {
      alert("Error: " +err);
  });
}

function takeBoosterFunction(fromAddress, takeBooster) {
  takeBoosterPromise(fromAddress, takeBooster).catch(function(err) {
      alert("Error: " +err);
  });
}

function giveBirthFunction(fromAddress, giveBirthInput) {
  giveBirthPromise(fromAddress, giveBirthInput).catch(function(err) {
      alert("Error: " +err);
  });
}
