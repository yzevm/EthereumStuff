pragma solidity ^0.4.13;

import './AwesomeToken.sol';
import './math/SafeMath.sol';
import './ownership/Ownable.sol';

contract AwesomeCrowdsale is Ownable {
  using SafeMath for uint256;

  AwesomeToken public token;
  address public constant sigWallet = 0xB7eB63efa2dC72b7Bb30EA210962fDF37b82Be12;

  mapping(address => uint256) public purchaseOf;

  uint256 public constant startTime = 1510963200;
  uint256 public constant endTime = 1513555200;

  uint256 public constant softCap = 3000000000000000000;
  uint256 public constant hardCap = 7000000000000000000;
  uint256 public constant wholesalePurchase = 20000000000000000000;

  // amount of raised money in wei
  uint256 public amountRaised;

  bool fundingGoalReached = false;
  bool crowdsaleClosed = false;

  event Whitelisted(address addr, bool status);
  event GoalReached(address recipient, uint totalAmountRaised);
  event FundTransfer(address backer, uint amount, bool isContribution);

  // Addresses of whitelisted presale investors.
  mapping (address => bool) public whitelist;

  function AwesomeCrowdsale() {
    token = new AwesomeToken();
  }

  // fallback function can be used to buy tokens
  function () payable {
    buyTokens(msg.sender);
  }

  function buyTokens(address beneficiary) payable {

    require(beneficiary != 0x0);
    require(msg.value != 0);
    require(validPurchase());
    
    uint256 weiAmount = msg.value;
    uint256 tokens = 0;
    
    uint8 whitelistRate = 107; // whitelistRate, 7% bonus
    uint8 wholesaleRate = 106; // wholesaleRate, 6% bonus

    // calculate token amount to be created
    if (whitelist[msg.sender]) {
      tokens = weiAmount.mul(whitelistRate);
    } else if (weiAmount < wholesalePurchase) {
      // Not whitelisted so they must have sent over 20 ether 
      tokens = weiAmount.mul(wholesaleRate);
    } else {
      tokens = weiAmount.mul(getRate());
    }

    // update state
    amountRaised = amountRaised.add(weiAmount);
    token.mint(beneficiary, tokens);
  }

  function getRate() constant returns (uint8) {
    if (block.timestamp <= startTime +  3 days) return 105; // day 1 to 3, 5% bonus
    else if (block.timestamp <= startTime + 9 days) return 104; // day 4 to 9, 4% bonus
    else if (block.timestamp <= startTime + 15 days) return 103; // day 10 to 15, 3% bonus
    else if (block.timestamp <= startTime + 22 days) return 102; // day 16 to 22, 2% bonus
    else if (block.timestamp <= startTime + 30 days) return 101; // day 23 to 30, 1% bonus
    return 100; // no bonus
  }

  modifier afterSale() { if (now >= endTime) _; }

  function checkGoalReached() afterSale {
    if (amountRaised >= softCap){
      fundingGoalReached = true;
      GoalReached(sigWallet, amountRaised);
    }
    crowdsaleClosed = true;
  }

  function safeSaleWithdrawal() afterSale {
    if (!fundingGoalReached) {
      uint amount = purchaseOf[msg.sender];
      purchaseOf[msg.sender] = 0;
      if (amount > 0) {
        if (msg.sender.send(amount)) {
          FundTransfer(msg.sender, amount, false);
        } else {
          purchaseOf[msg.sender] = amount;
        }
      }
    }

    if (fundingGoalReached && sigWallet == msg.sender) {
      if (sigWallet.send(amountRaised)) {
        FundTransfer(sigWallet, amountRaised, false);
      } else {
        //If we fail to send the funds to beneficiary, unlock funders balance
        fundingGoalReached = false;
      }
    }
  }

  // @return true if the transaction can buy tokens
  function validPurchase() internal constant returns (bool) {
    bool canPurchase = now >= startTime && now <= endTime;
    bool saleTimeAmount = amountRaised.add(msg.value) <= hardCap;
    return canPurchase && saleTimeAmount;
  }

  // Allow the owner to update the presale whitelist
  function updateWhitelist(address _purchaser, bool _listed) onlyOwner {
    whitelist[_purchaser] = _listed;
    Whitelisted(_purchaser, _listed);
  }

}