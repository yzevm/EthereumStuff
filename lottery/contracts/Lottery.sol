pragma solidity ^0.4.24;

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    c = _a * _b;
    assert(c / _a == _b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // assert(_b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold
    return _a / _b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    assert(_b <= _a);
    return _a - _b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256 c) {
    c = _a + _b;
    assert(c >= _a);
    return c;
  }
}

contract Lottery {
    using SafeMath for uint256;

    uint256 constant public ONE_HUNDRED_PERCENTS = 10000;               // 100%
    uint256[] public DAILY_INTEREST = [111, 222, 333, 444];             // 1.11%, 2.22%, 3.33%, 4.44%
    uint256 constant public MARKETING__AND_TEAM_FEE = 1000;             // 10%
    uint256 public referralPercents = 1000;                             // 10%
    uint256 constant public MAX_USER_DEPOSITS_COUNT = 50;               // 50 times
    uint256 constant public MINIMUM_DEPOSIT = 100 finney;               // 0.1 eth
    uint256 constant public MAX_DEPOSIT_TIME = 50 days;                 // 50 days
    uint256 public wave = 0;

    struct Deposit {
        uint256 time;
        uint256 amount;
        uint256 interest;
    }

    struct User {
        address referrer;
        uint256 referralAmount;
        uint256 firstTime;
        uint256 lastPayment;
        Deposit[] deposits;
        uint256 referBonus;
    }

    address public marketingAndTeam = 0x1111111111111111111111111111111111111111; // need to change
    address public owner = 0x1111111111111111111111111111111111111111;
    uint256 public totalDeposits;
    bool public running = true;
    mapping(uint256 => mapping(address => User)) public users;

    event InvestorAdded(address indexed investor);
    event ReferrerAdded(address indexed investor, address indexed referrer);
    event DepositAdded(address indexed investor, uint256 indexed depositsCount, uint256 amount);
    event UserDividendPayed(address indexed investor, uint256 dividend);
    event DepositDividendPayed(address indexed investor, uint256 indexed index, uint256 deposit, uint256 totalPayed, uint256 dividend);
    event ReferrerPayed(address indexed investor, address indexed referrer, uint256 amount, uint256 refAmount);
    event FeePayed(address indexed investor, uint256 amount);
    event TotalDepositsChanged(uint256 totalDeposits);
    event BalanceChanged(uint256 balance);
    
    function() public payable {
        User storage user = users[wave][msg.sender];

        // Dividends
        uint256[] memory dividends = dividendsForUser(msg.sender);
        uint256 dividendsSum = _dividendsSum(dividends).add(user.referBonus);
        if (dividendsSum > 0) {
            if (dividendsSum >= address(this).balance) {
                dividendsSum = address(this).balance;
                running = false;
            }
            
            user.referBonus = 0;
            user.lastPayment = now;
            msg.sender.transfer(dividendsSum);
            emit UserDividendPayed(msg.sender, dividendsSum);
            
            for (uint i = 0; i < dividends.length; i++) {
                emit DepositDividendPayed(
                    msg.sender,
                    i,
                    user.deposits[i].amount,
                    dividendsForAmountAndTime(user.deposits[i].amount, now.sub(user.deposits[i].time), user.deposits[i].interest),
                    dividends[i]
                );
            }

            // Cleanup deposits array a bit
            for (i = 0; i < user.deposits.length; i++) {
                if (now >= user.deposits[i].time.add(MAX_DEPOSIT_TIME)) {
                    user.deposits[i] = user.deposits[user.deposits.length - 1];
                    user.deposits.length -= 1;
                    i -= 1;
                }
            }
        }

        // Deposit
        if (msg.value >= MINIMUM_DEPOSIT) {
            if (user.firstTime == 0) {
                user.firstTime = now;
                user.lastPayment = now;
                emit InvestorAdded(msg.sender);
            }
            
            // Create deposit
            user.deposits.push(Deposit({
                time: now,
                amount: msg.value,
                interest: getUserInterest(msg.sender)
            }));
            require(user.deposits.length <= MAX_USER_DEPOSITS_COUNT, "Too many deposits per user");
            emit DepositAdded(msg.sender, user.deposits.length, msg.value);

            // Add to total deposits
            totalDeposits = totalDeposits.add(msg.value);
            emit TotalDepositsChanged(totalDeposits);

            // Add referral if possible
            if (user.referrer == address(0) && msg.data.length == 20) {
                address newReferrer = _bytesToAddress(msg.data);
                if (newReferrer != address(0) && newReferrer != msg.sender && users[wave][newReferrer].firstTime > 0) {
                    user.referrer = newReferrer;
                    _addReferralAmount(newReferrer);
                    emit ReferrerAdded(msg.sender, newReferrer);
                    uint256 refAmount = msg.value.mul(referralPercents).div(ONE_HUNDRED_PERCENTS);
                    users[wave][newReferrer].referBonus = users[wave][newReferrer].referBonus.add(refAmount);
                }
            }

            // Marketing and Team fee
            uint256 marketingAndTeamFee = msg.value.mul(MARKETING__AND_TEAM_FEE).div(ONE_HUNDRED_PERCENTS);
            marketingAndTeam.transfer(marketingAndTeamFee); // solium-disable-line security/no-send
            emit FeePayed(msg.sender, marketingAndTeamFee);
        }

        emit BalanceChanged(address(this).balance);

        // Reset
        if (!running) {
            wave = wave.add(1);
            running = true;
        }
    }
    
    function changeInterest(uint256[] interestList) external {
        require(address(msg.sender) == owner);
        DAILY_INTEREST = interestList;
    }
    
    function _addReferralAmount(address wallet) internal {
        User storage userFromReferral = users[wave][wallet];
        userFromReferral.referralAmount += 1;
    }

    function getUserInterest(address wallet) public view returns (uint256) {
        User storage user = users[wave][wallet];
        if (user.referralAmount == 0) {
            return DAILY_INTEREST[0];
        } else if (user.referralAmount == 1) {
            return DAILY_INTEREST[1];
        } else if (user.referralAmount == 2) {
            return DAILY_INTEREST[2];
        } else {
            return DAILY_INTEREST[3];
        }
    }

    function depositsCountForUser(address wallet) public view returns(uint256) {
        return users[wave][wallet].deposits.length;
    }

    function depositForUser(address wallet, uint256 index) public view returns(uint256 time, uint256 amount) {
        time = users[wave][wallet].deposits[index].time;
        amount = users[wave][wallet].deposits[index].amount;
    }

    function dividendsSumForUser(address wallet) public view returns(uint256 dividendsSum) {
        return _dividendsSum(dividendsForUser(wallet));
    }

    function dividendsForUser(address wallet) public view returns(uint256[] dividends) {
        User storage user = users[wave][wallet];
        dividends = new uint256[](user.deposits.length);

        for (uint i = 0; i < user.deposits.length; i++) {
            uint256 duration = now.sub(user.lastPayment);
            uint256 howOld = now.sub(user.deposits[i].time);
            if (howOld > MAX_DEPOSIT_TIME) {
                uint256 overtime = howOld.sub(MAX_DEPOSIT_TIME);
                duration = duration.sub(overtime);
            }
            dividends[i] = dividendsForAmountAndTime(user.deposits[i].amount, duration, user.deposits[i].interest);
        }
    }

    function dividendsForAmountAndTime(uint256 amount, uint256 duration, uint256 interest) public pure returns(uint256) {
        return amount
            .mul(interest).div(ONE_HUNDRED_PERCENTS)
            .mul(duration).div(1 days);
    }

    function _bytesToAddress(bytes data) private pure returns(address addr) {
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            addr := mload(add(data, 20)) 
        }
    }

    function _dividendsSum(uint256[] dividends) private pure returns(uint256 dividendsSum) {
        for (uint i = 0; i < dividends.length; i++) {
            dividendsSum = dividendsSum.add(dividends[i]);
        }
    }
}