pragma solidity ^0.4.16;

interface FreelanceHouseToken {
    function transfer(address receiver, uint amount);
}

library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }

}

contract Ownable {
  address public owner;

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  function Ownable() {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) {
      owner = newOwner;
    }
  }

}

/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;


  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused public {
    paused = true;
    Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    Unpause();
  }
}

contract FreelanceHousePreSale is Pausable {
    using SafeMath for uint256;

    address public investWallet = 0x8503AAb7e9178174847302d6D06af5fbfEfcf444;
    FreelanceHouseToken public tokenReward;

    uint256 public tokenPrice = 10000; // 1 token = 0.0001 eth
    uint256 public minimalPrice = 1000000000000000; // 0.001 => min = 0.01 eth 10000000000000000

    uint256 public startTime; // 1523836800 16/04/2018 @ 12:00am (UTC)
    uint256 public endTime; // 1526256000 14/05/2018 @ 12:00am (UTC)

    uint256 public constant bonus1 = 10000000000000000; // 0.01   => 1000000000000000000
    uint256 public constant bonus10 = 100000000000000000; // 0.1   => 10000000000000000000
    uint256 public constant bonus15 = 150000000000000000; // 0.15   => 15000000000000000000
    uint256 public constant bonus25 = 250000000000000000; // 0.25   => 25000000000000000000
    uint256 public constant bonus50 = 500000000000000000; // 0.5   => 50000000000000000000

    function FreelanceHousePreSale(address _tokenReward) {
        tokenReward = FreelanceHouseToken(_tokenReward);
        endTime = now + 7 minutes;
        startTime = now;
    }

    function () payable {
        buy(msg.sender);
    }

    function getRate() constant returns (uint256) {
        if (block.timestamp <= startTime +  3 minutes) return 150; // +  7 days
        else if (block.timestamp <= startTime + 6 minutes) return 140; // + 14 days
        else if (block.timestamp <= startTime + 9 minutes) return 130; // + 21 days
        else if (block.timestamp <= startTime + 12 minutes) return 120; // + 28 days
        return 100;
    }

    function buy(address buyer) whenNotPaused payable {
        require(buyer != address(0));
        require(msg.value != 0);
        require(msg.value >= minimalPrice);
        // require(now >= startTime);
        // require(now <= endTime);

        uint256 tokensAmountBonus;
        uint256 amount = msg.value;
        uint256 tokensWithTimeBonus = amount.mul(tokenPrice).mul(getRate()).div(100);

        if (amount >= bonus1 && amount < bonus10) {
          tokensAmountBonus = amount.mul(tokenPrice).mul(5).div(100);
        } else if (amount >= bonus10 && amount < bonus15) {
          tokensAmountBonus = amount.mul(tokenPrice).mul(10).div(100);
        } else if (amount >= bonus15 && amount < bonus25) {
          tokensAmountBonus = amount.mul(tokenPrice).mul(15).div(100);
        } else if (amount >= bonus25 && amount < bonus50) {
          tokensAmountBonus = amount.mul(tokenPrice).mul(20).div(100);
        } else if (amount >= bonus50) {
          tokensAmountBonus = amount.mul(tokenPrice).mul(30).div(100);
        }

        uint256 tokens = tokensWithTimeBonus.add(tokensAmountBonus);

        tokenReward.transfer(buyer, tokens);
    }

    function updatePrice(uint256 _tokenPrice) onlyOwner {
        tokenPrice = _tokenPrice;
    }

    function transferFunds() {
        require(now >= endTime);
        investWallet.transfer(this.balance);
    }

    function updateMinimal(uint256 _minimalPrice) onlyOwner {
        minimalPrice = _minimalPrice;
    }

    function transferTokens(uint256 _tokens) onlyOwner {
        tokenReward.transfer(owner, _tokens); 
    }

    function airdrop(address[] _array1, uint256[] _array2) onlyOwner {
        address[] memory arrayAddress = _array1;
        uint256[] memory arrayAmount = _array2;
        uint256 arrayLength = arrayAddress.length.sub(1);
        uint256 i = 0;
       
        while (i <= arrayLength) {
            tokenReward.transfer(arrayAddress[i], arrayAmount[i]);
            i = i.add(1);
        }  
   }

}