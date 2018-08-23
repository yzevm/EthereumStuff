pragma solidity ^0.4.21;

contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

contract ERC20 {
  function totalSupply() public view returns (uint256);

  function balanceOf(address _who) public view returns (uint256);

  function allowance(address _owner, address _spender)
    public view returns (uint256);

  function transfer(address _to, uint256 _value) public returns (bool);

  function approve(address _spender, uint256 _value)
    public returns (bool);

  function transferFrom(address _from, address _to, uint256 _value)
    public returns (bool);

  event Transfer(
    address indexed from,
    address indexed to,
    uint256 value
  );

  event Approval(
    address indexed owner,
    address indexed spender,
    uint256 value
  );
}

library SafeMath {

  /**
  * @dev Multiplies two numbers, reverts on overflow.
  */
  function mul(uint256 _a, uint256 _b) internal pure returns (uint256) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (_a == 0) {
      return 0;
    }

    uint256 c = _a * _b;
    require(c / _a == _b);

    return c;
  }

  /**
  * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
  */
  function div(uint256 _a, uint256 _b) internal pure returns (uint256) {
    require(_b > 0); // Solidity only automatically asserts when dividing by 0
    uint256 c = _a / _b;
    // assert(_a == _b * c + _a % _b); // There is no case in which this doesn't hold

    return c;
  }

  /**
  * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 _a, uint256 _b) internal pure returns (uint256) {
    require(_b <= _a);
    uint256 c = _a - _b;

    return c;
  }

  /**
  * @dev Adds two numbers, reverts on overflow.
  */
  function add(uint256 _a, uint256 _b) internal pure returns (uint256) {
    uint256 c = _a + _b;
    require(c >= _a);

    return c;
  }

  /**
  * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  function mod(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b != 0);
    return a % b;
  }
}

contract TokenBase is ERC20 {
  using SafeMath for uint256;

  mapping (address => mapping (address => uint256)) public allowed;
  
  TokenData public tokenData;
  constructor() public {
    tokenData = TokenData(msg.sender);
  }

  function allowance(
    address _owner,
    address _spender
   )
    public
    view
    returns (uint256)
  {
    return allowed[_owner][_spender];
  }

  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function increaseApproval(
    address _spender,
    uint256 _addedValue
  )
    public
    returns (bool)
  {
    allowed[msg.sender][_spender] = (
      allowed[msg.sender][_spender].add(_addedValue));
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  function decreaseApproval(
    address _spender,
    uint256 _subtractedValue
  )
    public
    returns (bool)
  {
    uint256 oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue >= oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}

contract WRDToken is TokenBase {
    
    string public constant name = "Wired Token";
    string public constant symbol = "WRD";
    uint8 public constant decimals = 18;
    
    constructor (address _founders, uint256 _foundersAmount, uint256 _senderAmount) public {
        emit Transfer(address(0x0), address(_founders), _foundersAmount);
        emit Transfer(address(0x0), address(msg.sender), _senderAmount);
    }
    
    function balanceOf(address _holder) public view returns (uint256) {
        uint256[2] memory arr = tokenData.lookBonus(_holder);
        if (!tokenData.staff(msg.sender)) {
            return tokenData.lookBalanceWRD(_holder).add(arr[0]);
        }
        return tokenData.WRDbalances(_holder);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        uint256[2] memory arr = tokenData.lookBonus(msg.sender);
        require(_to != address(0));
        require(_value <= tokenData.WRDbalances(msg.sender));
        if (!tokenData.staff(msg.sender)) {
            require(_value <= tokenData.lookBalanceWRD(msg.sender).add(arr[0]));
        }
        
        tokenData.transferWRD(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        uint256[2] memory arr = tokenData.lookBonus(_from);
        require(_value <= tokenData.WR2balances(msg.sender));
        if (!tokenData.staff(msg.sender)) {
            require(_value <= tokenData.lookBalanceWRD(_from).add(arr[0]));
        }
        require(_value <= allowed[_from][msg.sender]);
        require(_to != address(0));
        
        tokenData.transferWRD(_from, _to, _value);
        allowed[_from][_to] = allowed[_from][_to].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    function totalSupply() public view returns (uint256) {
        return tokenData.totalWRD();
    }
}

contract WR2Token is TokenBase {
    
    string public constant name = "WiredToken2";
    string public constant symbol = "WR2";
    uint8 public constant decimals = 18;
    
    function balanceOf(address _holder) public view returns (uint256) {
        uint256[2] memory arr = tokenData.lookBonus(_holder);
        return tokenData.WR2balances(_holder).add(arr[1]);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        uint256[2] memory arr = tokenData.lookBonus(msg.sender);
        require(_value <= tokenData.WR2balances(msg.sender).add(arr[1]));
        require(_to != address(0));
        
        tokenData.transferWR2(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        uint256[2] memory arr = tokenData.lookBonus(_from);
        require(_value <= tokenData.WR2balances(_from).add(arr[1]));
        require(_value <= allowed[_from][msg.sender]);
        require(_to != address(0));
        
        tokenData.transferWR2(_from, _to, _value);
        allowed[_from][_to] = allowed[_from][_to].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    function totalSupply() public view returns (uint256) {
        return tokenData.totalWR2();
    }
}

contract TokenData is Ownable {
    using SafeMath for uint256;
    
    uint32 constant month = 2592000;
    uint8 constant divBonus = 20;
    
    WRDToken public wrdToken;
    WR2Token public wr2Token;
    uint256 public totalWRD = 1300000000000000000000000000000;
    uint256 public totalWR2;
    
    bool public listing = false;
    uint256 public launchTime = 999999999999999999999999999999;
    address public agentAddress;

    mapping(address => uint256) public lastUpdate;
    mapping(address => uint256) public startTime;
    mapping(address => uint256) public WRDbalances;
    mapping(address => uint256) public WR2balances;
    mapping(address => bool) public staff;
    
    mapping(address => uint256) public airdropTokens;
    mapping(address => uint256) public presaleTokens;
    
    uint256 public totalAirdropTokens;
    uint256 public totalPresaleTokens;
    
    constructor(address _founders) public {
        wrdToken = new WRDToken(_founders, totalWRD.mul(4).div(10), totalWRD.mul(6).div(10));
        wr2Token = new WR2Token();
        
        agentAddress = msg.sender;
        staff[owner] = true;
        staff[agentAddress] = true;
        staff[address(this)] = true;
        
        WRDbalances[address(this)] = totalWRD.mul(6).div(10);
        WRDbalances[address(_founders)] = totalWRD.mul(4).div(10);
        presaleTokens[address(_founders)] = totalWRD.mul(4).div(10); // lockup for founders
        startTime[address(this)] = now;
        startTime[address(_founders)] = now;
        
        // for test, remove when gonna deploy to mainnet
        WRDbalances[msg.sender] = 5000;
        WR2balances[msg.sender] = 1000;
        presaleTokens[msg.sender] = 500;
        airdropTokens[msg.sender] = 100;
        startTime[msg.sender] = 1494547200; // 2017-05-12
    }
    
    modifier afterListing() {
        require(listing == true || staff[msg.sender]);
        _;
    }
    
    modifier onlyAgent() {
        require(msg.sender == agentAddress || msg.sender == owner);
        _;
    }
    
    function lookBalanceWRD(address _holder) public view returns (uint256) {
        if (now >= launchTime.add(365 days)) {
            uint pastMonths = (now.sub(launchTime.add(365 days))).div(month);
            uint percentage = 100;
            
            if (pastMonths == 1) {
                percentage = 99;
            } else if (pastMonths > 1) {
                percentage = uint(99).sub(uint(2).mul(pastMonths.sub(1)));
            }
            return WRDbalances[_holder].sub((presaleTokens[_holder].add(airdropTokens[_holder])).mul(percentage).div(100));
        } else {
            return WRDbalances[_holder].sub(presaleTokens[_holder].add(airdropTokens[_holder]));
        }
    }
    
    
    function transferWRD(address _from, address _to, uint256 _value) external {
        require(msg.sender == address(wrdToken));
        
        updateBonus(_from);
        if (startTime[_from] == 0) {
            startTime[_from] = now;
        }
        if (address(_from) != address(_to)) {
            updateBonus(_to);
            if (startTime[_to] == 0) {
                startTime[_to] = now;
            }
        }
        
        WRDbalances[_from] = WRDbalances[_from].sub(_value);
        WRDbalances[_to] = WRDbalances[_to].add(_value);
    }
    
    function transferWR2(address _from, address _to, uint256 _value) afterListing external {
        require(msg.sender == address(wr2Token));
        
        updateBonus(_from);
        if (startTime[_from] == 0) {
            startTime[_from] = now;
        }
        if (address(_from) != address(_to)) {
            updateBonus(_to);
            if (startTime[_to] == 0) {
                startTime[_to] = now;
            }
        }
        
        WR2balances[_from] = WR2balances[_from].sub(_value);
        WR2balances[_to] = WR2balances[_to].add(_value);
    }

    function updateBonus(address _holder) public returns (bool) {
        uint256 pastMonths = (now.sub(lastUpdate[_holder].mul(month).add(startTime[msg.sender]))).div(month);
        if (startTime[msg.sender] != 0 && pastMonths > 0) {
            uint256[2] memory arr = lookBonus(_holder);
            
            WRDbalances[_holder] = WRDbalances[_holder].add(arr[0]);
            WR2balances[_holder] = WR2balances[_holder].add(arr[1]);
            totalWRD = totalWRD.add(arr[0]);
            totalWR2 = totalWR2.add(arr[1]);
            
            lastUpdate[_holder] = lastUpdate[_holder].add(pastMonths);
        }
    }
    
    function lookBonus(address _holder) public view returns (uint256[2]) {
        uint[2] memory arr;
        uint newABonus;
        
        if (startTime[msg.sender] != 0) {
            uint pastMonths = (now.sub(lastUpdate[_holder].mul(month).add(startTime[msg.sender]))).div(month);
            for (uint i = 0; i < pastMonths; i++) {
                newABonus = arr[0].add((WR2balances[_holder].add(arr[1])).div(divBonus));
                arr[1] = arr[1].add((lookBalanceWRD(_holder).add(arr[0])).div(divBonus));
                arr[0] = newABonus;
            }
        }
        
        return arr;
    }
    
    function addStaff(address _staff, bool _meaning) external onlyOwner {
        staff[_staff] = _meaning;
    }
    
    function transferAgent(address _agent) external onlyOwner {
        agentAddress = _agent;
    }
    
    function startListing() public onlyOwner {
        require(!listing);
        launchTime = now;
        listing = true;
    }
    
    function addAirdropTokens(address[] sender, uint256[] amount) external onlyAgent {
        require(sender.length > 0 && sender.length == amount.length);
    
        for (uint i = 0; i < sender.length; i++) {
            require(totalAirdropTokens.add(amount[i]) <= totalWRD.mul(5).div(100));
            wrdToken.transfer(sender[i], amount[i]);
            airdropTokens[sender[i]] = amount[i];
            updateBonus(sender[i]);
            if (startTime[sender[i]] == 0) {
                startTime[sender[i]] = now;
            }
            totalAirdropTokens = totalAirdropTokens.add(amount[i]);
        }
    }
    
    function addPresaleTokens(address[] sender, uint256[] amount) external onlyAgent {
        require(sender.length > 0 && sender.length == amount.length);
    
        for (uint i = 0; i < sender.length; i++) {
            require(totalPresaleTokens.add(amount[i]) <= totalWRD.mul(15).div(100));
            wrdToken.transfer(sender[i], amount[i]);
            presaleTokens[sender[i]] = amount[i];
            updateBonus(sender[i]);
            if (startTime[sender[i]] == 0) {
                startTime[sender[i]] = now;
            }
            totalPresaleTokens = totalPresaleTokens.add(amount[i]);
        }
    }
}