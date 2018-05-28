pragma solidity ^0.4.18;

library SafeMath {

  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a / b;
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Ownable {
  address public owner;
  address public manager;

  function Ownable() public {
    owner = msg.sender;
    manager = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyManagment() {
    require(msg.sender == owner || msg.sender == manager);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    owner = newOwner;
  }

  function transferManagment(address newManager) public onlyOwner {
    require(newManager != address(0));
    manager = newManager;
  }

}

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;

  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  modifier whenPaused() {
    require(paused);
    _;
  }

  function pause() onlyOwner whenNotPaused public {
    paused = true;
    Pause();
  }

  function unpause() onlyOwner whenPaused public {
    paused = false;
    Unpause();
  }
}

contract DataBase is Pausable {
    using SafeMath for uint256;
    
    mapping (address => address) public referral;
    mapping (address => bool) public addReferral;
    mapping (address => bool) public realPartner;
    
    mapping (address => uint256) public highBalances;
    mapping (address => uint256) public highBuyPrice;
    mapping (address => bool) public highIsPurchase;
    
    mapping (address => uint256) public averageBalances;
    mapping (address => uint256) public averageBuyPrice;
    mapping (address => bool) public averageIsPurchase;

    mapping (address => uint256) public lowBalances;
    mapping (address => uint256) public lowBuyPrice;
    mapping (address => bool) public lowIsPurchase;
    
    mapping (address => uint256) public futureBalances;
    mapping (address => uint256) public futureBuyPrice;
    mapping (address => bool) public futureIsPurchase;
    
    uint256 public highTokenPrice = 10000; // 10000 => 100.00 => 1 / 100 = 0.01
    uint256 public averageTokenPrice = 20000; // 20000 => 200.00 => 1 / 200 = 0.02
    uint256 public lowTokenPrice = 30000; // 30000 => 300.00 => 1 / 300 = 0.03
    uint256 public futureTokenPrice;

    address public highFundDeposit;
    address public averageFundDeposit;
    address public lowFundDeposit;
    address public futureFundDeposit;
    HighWithdraw public highWithdraw;
    AverageWithdraw public averageWithdraw;
    LowWithdraw public lowWithdraw;
    FutureWithdraw public futureWithdraw;

    address public highInvest = 0xa869010473B0662Ae1e100EEfea416a8043983A5;
    address public averageInvest = 0xedc3B6301d849F1080bf11E31De7eeF96d8fF94e;
    address public lowInvest = 0x198E13017D2333712Bd942d8B028610b95C363da;
    address public futureInvest;
    
    event NewTokenPrices(uint256 high, uint256 average, uint256 low, uint256 future);

    function DataBase() {
        futureWithdraw = FutureWithdraw(msg.sender); // for later
    }

    modifier onlyStaffWallet() {
        require(msg.sender == owner || msg.sender == highFundDeposit || msg.sender == averageFundDeposit || msg.sender == lowFundDeposit || msg.sender == futureFundDeposit || msg.sender == address(highWithdraw) || msg.sender == address(averageWithdraw) || msg.sender == address(lowWithdraw) || msg.sender == address(futureWithdraw));
        _;
    }

    function setWithdraw(address _highWithdraw, address _averageWithdraw, address _lowWithdraw, address _futureWithdraw) onlyOwner {
        highWithdraw = HighWithdraw(_highWithdraw);
        averageWithdraw = AverageWithdraw(_averageWithdraw);
        lowWithdraw = LowWithdraw(_lowWithdraw);
        futureWithdraw = FutureWithdraw(_futureWithdraw);
    }
    
    function setFund(address _highFundDep, address _averageFundDep, address _lowFundDep, address _futureFundDep) onlyOwner {
        highFundDeposit = _highFundDep;
        averageFundDeposit = _averageFundDep;
        lowFundDeposit = _lowFundDep;
        futureFundDeposit = _futureFundDep;
    }
    
    function changeTokenPrices(uint256 _highTokenPrice, uint256 _averageTokenPrice, uint256 _lowTokenPrice, uint256 _futureTokenPrice) onlyManagment {
        highTokenPrice = _highTokenPrice;
        averageTokenPrice = _averageTokenPrice;
        lowTokenPrice = _lowTokenPrice;
        futureTokenPrice = _futureTokenPrice;
        NewTokenPrices(highTokenPrice, averageTokenPrice, lowTokenPrice, futureTokenPrice);
    }

    function setRealReferral(address investor, bool meaning) public onlyStaffWallet {
        realPartner[investor] = meaning;
    }
    
    function setNewReferral(address investor, address referralAddress) public onlyStaffWallet {
        referral[investor] = referralAddress;
    }
    
    function setNewAddRefer(address investor, bool meaning) public onlyStaffWallet {
        addReferral[investor] = meaning;
    }
    
    function highSetNewBalances(address investor, uint256 investAmount) public onlyStaffWallet {
        highBalances[investor] = investAmount;
    }
    
    function highSetNewBuyPrice(address investor) public onlyStaffWallet {
        highBuyPrice[investor] = highTokenPrice;
    }

    function highSetNewisPurchase(address investor, bool meaning) public onlyStaffWallet {
        highIsPurchase[investor] = meaning;
    }
    
    function averageSetNewBalances(address investor, uint256 investAmount) public onlyStaffWallet {
        averageBalances[investor] = investAmount;
    }
    
    function averageSetNewBuyPrice(address investor) public onlyStaffWallet {
        averageBuyPrice[investor] = averageTokenPrice;
    }

    function averageSetNewisPurchase(address investor, bool meaning) public onlyStaffWallet {
        averageIsPurchase[investor] = meaning;
    }
    
    function lowSetNewBalances(address investor, uint256 investAmount) public onlyStaffWallet {
        lowBalances[investor] = investAmount;
    }
    
    function lowSetNewBuyPrice(address investor) public onlyStaffWallet {
        lowBuyPrice[investor] = lowTokenPrice;
    }

    function lowSetNewisPurchase(address investor, bool meaning) public onlyStaffWallet {
        lowIsPurchase[investor] = meaning;
    }
    
    function futureSetNewBalances(address investor, uint256 investAmount) public onlyStaffWallet {
        futureBalances[investor] = investAmount;
    }
    
    function futureSetNewBuyPrice(address investor) public onlyStaffWallet {
        futureBuyPrice[investor] = lowTokenPrice;
    }

    function futureSetNewisPurchase(address investor, bool meaning) public onlyStaffWallet {
        futureIsPurchase[investor] = meaning;
    }

}

contract HighFundDeposit is Pausable {
    using SafeMath for uint256;
    
    DataBase public database;
    string constant public name = "High Risk BTC-Center";
    string constant public symbol = "HRBTC";
    uint8 constant public decimals = 18;
    event Transfer(address indexed from, address indexed to, uint256 value);

    uint256 public highDepComFirst = 3;
    uint256 public highDepComSecond = 2;
    uint256 public highDepComThird = 1;

    event highEnter(address indexed from, address indexed to, uint256 value, address ref1A, uint256 ref1M, address ref2A, uint256 ref2M, address ref3A, uint256 ref3M);
    
    function HighFundDeposit(address _database) {
        database = DataBase(_database);
    }
    
    function () payable whenNotPaused {
        buyHigh(address(0));
    }
    
    function buyHigh(address referralAddr) payable whenNotPaused {
        
        require(database.highIsPurchase(msg.sender) == false);
        
        if (database.addReferral(msg.sender) == false && referralAddr != address(0)) {
            require(referralAddr != msg.sender);
            require(referralAddr != address(0));
            database.setNewReferral(msg.sender, referralAddr);
            database.setNewAddRefer(msg.sender, true);
        }
        
        uint256 tokenFundPrice = database.highTokenPrice();
        address investWallet = database.highInvest();
        
        address ref1 = database.referral(msg.sender);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);

        uint256 refMoney1;
        uint256 refMoney2;
        uint256 refMoney3;

        uint256 weiAmount = msg.value;
        uint256 investAmount = weiAmount.mul(tokenFundPrice).div(100);
        database.highSetNewBalances(msg.sender, investAmount);
        database.highSetNewBuyPrice(msg.sender);
        Transfer(msg.sender, this, investAmount);
        
        if (ref1 != address(0)) {
            refMoney1 = weiAmount.div(100).mul(highDepComFirst);
            ref1.transfer(refMoney1);
        }
        
        if (ref2 != address(0)) {
            refMoney2 = weiAmount.div(100).mul(highDepComSecond);
            ref2.transfer(refMoney2);
        }
        
        if (ref3 != address(0)) {
            refMoney3 = weiAmount.div(100).mul(highDepComThird);
            ref3.transfer(refMoney3);
        }
        
        investWallet.transfer(this.balance);
        database.highSetNewisPurchase(msg.sender, true);
        highEnter(msg.sender, this, weiAmount, ref1, refMoney1, ref2, refMoney2, ref3, refMoney3);
    }
    
}

contract AverageFundDeposit is Pausable {
    using SafeMath for uint256;
    
    DataBase public database;
    string constant public name = "Average Risk BTC-Center";
    string constant public symbol = "ARBTC";
    uint8 constant public decimals = 18;
    event Transfer(address indexed from, address indexed to, uint256 value);

    uint256 public averageDepComFirst = 4;
    uint256 public averageDepComSecond = 2;
    uint256 public averageDepComThird = 1;
    
    event averageEnter(address indexed from, address indexed to, uint256 value, address ref1A, uint256 ref1M, address ref2A, uint256 ref2M, address ref3A, uint256 ref3M);

    function AverageFundDeposit(address _database) {
        database = DataBase(_database);
    }
    
    function () payable whenNotPaused {
        buyAverage(address(0));
    }
    
    function buyAverage(address referralAddr) payable whenNotPaused {
        
        require(database.averageIsPurchase(msg.sender) == false);
        
        if (database.addReferral(msg.sender) == false && referralAddr != address(0)) {
            require(referralAddr != msg.sender);
            require(referralAddr != address(0));
            database.setNewReferral(msg.sender, referralAddr);
            database.setNewAddRefer(msg.sender, true);
        }
        
        uint256 tokenFundPrice = database.averageTokenPrice();
        address investWallet = database.averageInvest();
        
        address ref1 = database.referral(msg.sender);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);

        uint256 refMoney1;
        uint256 refMoney2;
        uint256 refMoney3;

        uint256 weiAmount = msg.value;
        uint256 investAmount = weiAmount.mul(tokenFundPrice).div(100);
        database.averageSetNewBalances(msg.sender, investAmount);
        database.averageSetNewBuyPrice(msg.sender);
        Transfer(msg.sender, this, investAmount);
        
        if (ref1 != address(0)) {
            refMoney1 = weiAmount.div(100).mul(averageDepComFirst);
            ref1.transfer(refMoney1);
        }
        
        if (ref2 != address(0)) {
            refMoney2 = weiAmount.div(100).mul(averageDepComSecond);
            ref2.transfer(refMoney2);
        }
        
        if (ref3 != address(0)) {
            refMoney3 = weiAmount.div(100).mul(averageDepComThird);
            ref3.transfer(refMoney3);
        }
        
        investWallet.transfer(this.balance);
        database.averageSetNewisPurchase(msg.sender, true);
        averageEnter(msg.sender, this, weiAmount, ref1, refMoney1, ref2, refMoney2, ref3, refMoney3);
    }
    
}

contract LowFundDeposit is Pausable {
    using SafeMath for uint256;
    
    DataBase public database;
    string constant public name = "Low Risk BTC-Center";
    string constant public symbol = "LRBTC";
    uint8 constant public decimals = 18;
    event Transfer(address indexed from, address indexed to, uint256 value);

    uint256 public lowDepComFirst = 5;
    uint256 public lowDepComSecond = 2;
    uint256 public lowDepComThird = 1;

    event lowEnter(address indexed from, address indexed to, uint256 value, address ref1A, uint256 ref1M, address ref2A, uint256 ref2M, address ref3A, uint256 ref3M);
    
    function LowFundDeposit(address _database) {
        database = DataBase(_database);
    }
    
    function () payable whenNotPaused {
        buyLow(address(0));
    }
    
    function buyLow(address referralAddr) payable whenNotPaused {
        
        require(database.lowIsPurchase(msg.sender) == false);
        
        if (database.addReferral(msg.sender) == false && referralAddr != address(0)) {
            require(referralAddr != msg.sender);
            require(referralAddr != address(0));
            database.setNewReferral(msg.sender, referralAddr);
            database.setNewAddRefer(msg.sender, true);
        }
        
        uint256 tokenFundPrice = database.lowTokenPrice();
        address investWallet = database.lowInvest();
        
        address ref1 = database.referral(msg.sender);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);

        uint256 refMoney1;
        uint256 refMoney2;
        uint256 refMoney3;

        uint256 weiAmount = msg.value;
        uint256 investAmount = weiAmount.mul(tokenFundPrice).div(100);
        database.lowSetNewBalances(msg.sender, investAmount);
        database.lowSetNewBuyPrice(msg.sender);
        Transfer(msg.sender, this, investAmount);
        
        if (ref1 != address(0)) {
            refMoney1 = weiAmount.div(100).mul(lowDepComFirst);
            ref1.transfer(refMoney1);
        }
        
        if (ref2 != address(0)) {
            refMoney2 = weiAmount.div(100).mul(lowDepComSecond);
            ref2.transfer(refMoney2);
        }
        
        if (ref3 != address(0)) {
            refMoney3 = weiAmount.div(100).mul(lowDepComThird);
            ref3.transfer(refMoney3);
        }
        
        investWallet.transfer(this.balance);
        database.lowSetNewisPurchase(msg.sender, true);
        lowEnter(msg.sender, this, weiAmount, ref1, refMoney1, ref2, refMoney2, ref3, refMoney3);
    }
    
}

contract HighWithdraw is Pausable {

    using SafeMath for uint256;
    
    DataBase public database;
    
    uint256 public highRefComFirst = 3;
    uint256 public highRefComSecond = 2;
    uint256 public highRefComThird = 1;

    event highBack(address indexed from, address indexed to, uint256 value, address ref1A, uint256 ref1M, address ref2A, uint256 ref2M, address ref3A, uint256 ref3M);
    
    function HighWithdraw(address _database) {
        database = DataBase(_database);
    }
        
    function newCommissions(uint256 _highRefComFirst, uint256 _higheRefComSecond, uint256 _highRefComThird) onlyOwner {
        highRefComFirst = _highRefComFirst;
        highRefComSecond = _higheRefComSecond;
        highRefComThird = _highRefComThird;
    }

    function _highInvestorSendWei(address investor) public view returns (uint256) {
        return database.highBalances(investor).div(database.highTokenPrice()).mul(100);
    }
    
    function _highSuccessProfit(address investor) public view returns (uint256) {
        uint256 investorTotalProfit = database.highBalances(investor).div(database.highTokenPrice()); 

        if (investorTotalProfit <= database.highBalances(investor).div(database.highBuyPrice(investor))) {
            return uint256(0);
        } else {
            return (investorTotalProfit.sub(database.highBalances(investor).div(database.highBuyPrice(investor)))).mul(100);
        }
    }

    function _highTotalSendWei(address investor) public view returns (uint256) {
        uint256 investorTotalProfit = database.highBalances(investor).div(database.highTokenPrice());
        address ref1 = database.referral(investor);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);
        
        if (investorTotalProfit <= database.highBalances(investor).div(database.highBuyPrice(investor))) {
            return investorTotalProfit.mul(100);
        } else {
            uint256 successProfit = (investorTotalProfit.sub(database.highBalances(investor).div(database.highBuyPrice(investor)))).mul(100);

            if (ref3 != address(0) && successProfit != 0 && database.realPartner(ref3) != false) {
                 return (investorTotalProfit.mul(100)).add(successProfit.mul(highRefComFirst.add(highRefComSecond).add(highRefComThird)).div(100));
            } else if (ref2 != address(0) && successProfit != 0 && database.realPartner(ref2) != false) {
                 return (investorTotalProfit.mul(100)).add(successProfit.mul(highRefComFirst.add(highRefComSecond)).div(100));
            } else if (ref1 != address(0) && successProfit != 0 && database.realPartner(ref1) != false) {
                return (investorTotalProfit.mul(100)).add(successProfit.mul(highRefComFirst).div(100));
            } else {
                 return investorTotalProfit.mul(100);
            }

        }
    }
    
    function sellHigh(address investor) payable whenNotPaused onlyManagment {
        
        uint256 tokenPrice = database.highTokenPrice();
        uint256 successProfit = _highSuccessProfit(investor);
        uint256 totalSendWei = _highTotalSendWei(investor);
        uint256 investorSendWei = _highInvestorSendWei(investor);
        
        require (msg.value >= totalSendWei);
        
        address ref1 = database.referral(investor);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);
        bool realPartner1 = database.realPartner(ref1);
        bool realPartner2 = database.realPartner(ref2);
        bool realPartner3 = database.realPartner(ref3);
        uint256 refMoney1;
        uint256 refMoney2;
        uint256 refMoney3;
        
        if (ref1 != address(0) && successProfit != 0 && realPartner1 != false) {
            refMoney1 = successProfit.div(100).mul(highRefComFirst);
            ref1.transfer(refMoney1);
        }
        
        if (ref2 != address(0) && successProfit != 0 && realPartner2 != false) {
            refMoney2 = successProfit.div(100).mul(highRefComSecond);
            ref2.transfer(refMoney2);
        }
        
        if (ref3 != address(0) && successProfit != 0 && realPartner3 != false) {
            refMoney3 = successProfit.div(100).mul(highRefComThird);
            ref3.transfer(refMoney3);
        }
        
        investor.transfer(investorSendWei);
        database.highSetNewisPurchase(investor, false);
        database.highSetNewBalances(investor, 0);
        highBack(this, investor, investorSendWei, ref1, refMoney1, ref2, refMoney2, ref3, refMoney3);

    }
}


contract AverageWithdraw is Pausable {

    using SafeMath for uint256;
    
    DataBase public database;
    
    uint256 public averageRefComFirst = 4;
    uint256 public averageRefComSecond = 2;
    uint256 public averageRefComThird = 1;
    event averageBack(address indexed from, address indexed to, uint256 value, address ref1A, uint256 ref1M, address ref2A, uint256 ref2M, address ref3A, uint256 ref3M);
    
    function AverageWithdraw(address _database) {
        database = DataBase(_database);
    }
    
    function newCommissions(uint256 _averageRefComFirst, uint256 _averageRefComSecond, uint256 _averageRefComThird) onlyOwner {
        averageRefComFirst = _averageRefComFirst;
        averageRefComSecond = _averageRefComSecond;
        averageRefComThird = _averageRefComThird;
    }

    function _averageInvestorSendWei(address investor) public view returns (uint256) {
        return database.averageBalances(investor).div(database.averageTokenPrice()).mul(100);
    }
    
    function _averageSuccessProfit(address investor) public view returns (uint256) {
        uint256 investorTotalProfit = database.averageBalances(investor).div(database.averageTokenPrice()); 

        if (investorTotalProfit <= database.averageBalances(investor).div(database.averageBuyPrice(investor))) {
            return uint256(0);
        } else {
            return (investorTotalProfit.sub(database.averageBalances(investor).div(database.averageBuyPrice(investor)))).mul(100);
        }
    }

    function _averageTotalSendWei(address investor) public view returns (uint256) {
        uint256 investorTotalProfit = database.averageBalances(investor).div(database.averageTokenPrice());
        address ref1 = database.referral(investor);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);
        
        if (investorTotalProfit <= database.averageBalances(investor).div(database.averageBuyPrice(investor))) {
            return investorTotalProfit.mul(100);
        } else {
            uint256 successProfit = (investorTotalProfit.sub(database.averageBalances(investor).div(database.averageBuyPrice(investor)))).mul(100);

            if (ref3 != address(0) && successProfit != 0 && database.realPartner(ref3) != false) {
                return (investorTotalProfit.mul(100)).add(successProfit.mul(averageRefComFirst.add(averageRefComSecond).add(averageRefComThird)).div(100));
            } else if (ref2 != address(0) && successProfit != 0 && database.realPartner(ref2) != false) {
                return (investorTotalProfit.mul(100)).add(successProfit.mul(averageRefComFirst.add(averageRefComSecond)).div(100));
            } else if (ref1 != address(0) && successProfit != 0 && database.realPartner(ref1) != false) {
                return (investorTotalProfit.mul(100)).add(successProfit.mul(averageRefComFirst).div(100));
            } else {
                return investorTotalProfit.mul(100);
            }

        }
    }
    
    function sellAverage(address investor) payable whenNotPaused onlyManagment {
        
        uint256 tokenPrice = database.averageTokenPrice();
        uint256 successProfit = _averageSuccessProfit(investor);
        uint256 totalSendWei = _averageTotalSendWei(investor);
        uint256 investorSendWei = _averageInvestorSendWei(investor);
        
        require (msg.value >= totalSendWei);
        
        address ref1 = database.referral(investor);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);
        bool realPartner1 = database.realPartner(ref1);
        bool realPartner2 = database.realPartner(ref2);
        bool realPartner3 = database.realPartner(ref3);
        uint256 refMoney1;
        uint256 refMoney2;
        uint256 refMoney3;
        
        if (ref1 != address(0) && successProfit != 0 && realPartner1 != false) {
            refMoney1 = successProfit.div(100).mul(averageRefComFirst);
            ref1.transfer(refMoney1);
        }
        
        if (ref2 != address(0) && successProfit != 0 && realPartner2 != false) {
            refMoney2 = successProfit.div(100).mul(averageRefComSecond);
            ref2.transfer(refMoney2);
        }
        
        if (ref3 != address(0) && successProfit != 0 && realPartner3 != false) {
            refMoney3 = successProfit.div(100).mul(averageRefComThird);
            ref3.transfer(refMoney3);
        }
        
        investor.transfer(investorSendWei);
        database.averageSetNewisPurchase(investor, false);
        database.averageSetNewBalances(investor, 0);
        averageBack(this, investor, investorSendWei, ref1, refMoney1, ref2, refMoney2, ref3, refMoney3);

    }
    
}


contract LowWithdraw is Pausable {

    using SafeMath for uint256;
    
    DataBase public database;

    uint256 public lowRefComFirst = 5;
    uint256 public lowRefComSecond = 2;
    uint256 public lowRefComThird = 1;    
    event lowBack(address indexed from, address indexed to, uint256 value, address ref1A, uint256 ref1M, address ref2A, uint256 ref2M, address ref3A, uint256 ref3M);
    
    function LowWithdraw(address _database) {
        database = DataBase(_database);
    }

    function newCommissions(uint256 _lowRefComFirst, uint256 _lowRefComSecond, uint256 _lowRefComThird) onlyOwner {
        lowRefComFirst = _lowRefComFirst;
        lowRefComSecond = _lowRefComSecond;
        lowRefComThird = _lowRefComThird;
    }
    
    function _lowInvestorSendWei(address investor) public view returns (uint256) {
        return database.lowBalances(investor).div(database.lowTokenPrice()).mul(100);
    }
    
    function _lowSuccessProfit(address investor) public view returns (uint256) {
        uint256 investorTotalProfit = database.lowBalances(investor).div(database.lowTokenPrice()); 

        if (investorTotalProfit <= database.lowBalances(investor).div(database.lowBuyPrice(investor))) {
            return uint256(0);
        } else {
            return (investorTotalProfit.sub(database.lowBalances(investor).div(database.lowBuyPrice(investor)))).mul(100);
        }
    }

    function _lowTotalSendWei(address investor) public view returns (uint256) {
        uint256 investorTotalProfit = database.lowBalances(investor).div(database.lowTokenPrice());
        address ref1 = database.referral(investor);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);
        
        if (investorTotalProfit <= database.lowBalances(investor).div(database.lowBuyPrice(investor))) {
            return investorTotalProfit.mul(100);
        } else {
            uint256 successProfit = (investorTotalProfit.sub(database.lowBalances(investor).div(database.lowBuyPrice(investor)))).mul(100);

            if (ref3 != address(0) && successProfit != 0 && database.realPartner(ref3) != false) {
                 return (investorTotalProfit.mul(100)).add(successProfit.mul(lowRefComFirst.add(lowRefComSecond).add(lowRefComThird)).div(100));
            } else if (ref2 != address(0) && successProfit != 0 && database.realPartner(ref2) != false) {
                 return (investorTotalProfit.mul(100)).add(successProfit.mul(lowRefComFirst.add(lowRefComSecond)).div(100)); 
            } else if (ref1 != address(0) && successProfit != 0 && database.realPartner(ref1) != false) {
                return (investorTotalProfit.mul(100)).add(successProfit.mul(lowRefComFirst).div(100));
            } else {
                 return investorTotalProfit.mul(100);
            }

        }
    }
    
    function sellLow(address investor) payable whenNotPaused onlyManagment {

        uint256 tokenPrice = database.lowTokenPrice();
        uint256 successProfit = _lowSuccessProfit(investor);
        uint256 totalSendWei = _lowTotalSendWei(investor);
        uint256 investorSendWei = _lowInvestorSendWei(investor);
        
        require (msg.value >= totalSendWei);
        
        address ref1 = database.referral(investor);
        address ref2 = database.referral(ref1);
        address ref3 = database.referral(ref2);
        bool realPartner1 = database.realPartner(ref1);
        bool realPartner2 = database.realPartner(ref2);
        bool realPartner3 = database.realPartner(ref3);
        uint256 refMoney1;
        uint256 refMoney2;
        uint256 refMoney3;
        
        if (ref1 != address(0) && successProfit != 0 && realPartner1 != false) {
            refMoney1 = successProfit.div(100).mul(lowRefComFirst);
            ref1.transfer(refMoney1);
        }
        
        if (ref2 != address(0) && successProfit != 0 && realPartner2 != false) {
            refMoney2 = successProfit.div(100).mul(lowRefComSecond);
            ref2.transfer(refMoney2);
        }
        
        if (ref3 != address(0) && successProfit != 0 && realPartner3 != false) {
            refMoney3 = successProfit.div(100).mul(lowRefComThird);
            ref3.transfer(refMoney3);
        }
        
        investor.transfer(investorSendWei);
        database.lowSetNewisPurchase(investor, false);
        database.lowSetNewBalances(investor, 0);
        lowBack(this, investor, investorSendWei, ref1, refMoney1, ref2, refMoney2, ref3, refMoney3);
    }
}

contract FutureWithdraw {
    
    uint256 public futureRefComFirst = 40;
    uint256 public futureRefComSecond = 20;
    uint256 public futureRefComThird = 10;
    
}
