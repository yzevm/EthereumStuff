pragma solidity ^0.4.20;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
    if (a == 0) {
      return 0;
    }
    c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    // uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return a / b;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
    c = a + b;
    assert(c >= a);
    return c;
  }
}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
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
  function Ownable() public {
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
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    emit OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }
}

contract ERC20Basic {
  function totalSupply() public view returns (uint256);
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract BasicToken is ERC20Basic, Ownable {
  using SafeMath for uint256;
    
  address[] staff;
  mapping (address => uint256) balances;
  uint256 totalSupply_;
  mapping (address => uint256) public preSaleTokens;
  mapping (address => uint256) public crowdSaleTokens;
  mapping (address => uint256) public freezeTokens;
  mapping (address => uint256) public freezeTimeBlock;
  uint256 public launchBlock = 999999999999999999999999999999;
  uint256 constant public monthSeconds = 2592000;
  uint256 constant public secsPerBlock = 15; // 1 block per 15 seconds
  uint256 public totalFreezeTokens = 0;
  bool public listing = false;
  bool public freezing = true;
  address public agentAddress;
  
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }
  
  modifier afterListing() {
    require(listing == true || checkStaff(msg.sender));
    _;
  }

  function checkStaff(address spender) public view returns(bool) {
    for (uint i = 0; i < staff.length; i++) {
      if (spender == staff[i]) return true;
    }
  }
  
  function checkVesting(address sender) public view returns (uint256) {
      if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(4))) {
          return balances[sender];
      } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(3))) {
          return balances[sender].sub((crowdSaleTokens[sender].mul(2).div(10)));
      } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(2))) {
          return balances[sender].sub((preSaleTokens[sender].mul(3).div(10)).add(crowdSaleTokens[sender].mul(4).div(10)));
      } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock))) {
          return balances[sender].sub((preSaleTokens[sender].mul(6).div(10)).add(crowdSaleTokens[sender].mul(6).div(10)));
      } else {
         return balances[sender].sub((preSaleTokens[sender].mul(9).div(10)).add(crowdSaleTokens[sender].mul(8).div(10)));
      }
  }
  
  function checkVestingWithFrozen(address sender) public view returns (uint256) {
      if (freezing) {
          
          if (freezeTimeBlock[sender] <= block.number) {
              return checkVesting(sender);
          } else {
              return checkVesting(sender).sub(freezeTokens[sender]);
          }
          
      } else {
          return checkVesting(sender);
      }
  }
  
  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) afterListing public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);
    require(_value <= checkVestingWithFrozen(msg.sender));

    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of. 
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }
}

contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract BurnableToken is BasicToken {

  event Burn(address indexed burner, uint256 value);

  /**
   * @dev Burns a specific amount of tokens.
   * @param _value The amount of token to be burned.
   */
  function burn(uint256 _value) afterListing public {
    require(_value <= balances[msg.sender]);
    require(_value <= checkVestingWithFrozen(msg.sender));
    // no need to require value <= totalSupply, since that would imply the
    // sender's balance is greater than the totalSupply, which *should* be an assertion failure

    address burner = msg.sender;
    balances[burner] = balances[burner].sub(_value);
    totalSupply_ = totalSupply_.sub(_value);
    emit Burn(burner, _value);
    emit Transfer(burner, address(0), _value);
  }
}

contract StandardToken is ERC20, BurnableToken {

  mapping (address => mapping (address => uint256)) allowed;

  function transferFrom(address _from, address _to, uint256 _value) afterListing public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(_value <= checkVestingWithFrozen(_from));

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);

    emit Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still avaible for the spender.
   */
  function allowance(address _owner, address _spender) public view returns (uint256) {
    return allowed[_owner][_spender];
  }
  
}

contract Founders is Ownable {
    using SafeMath for uint256;

  uint256 public launchBlock = 999999999999999999999999999999;
  uint256 constant public monthSeconds = 2592000;
  uint256 constant public secsPerBlock = 15; // 1 block per 15 seconds
  uint256 public withdrawTokens;
  address public teamWallet = 0x11231231231312313123132131231; // change before deploy
  AlbosToken public albosAddress;
  
  function Founders() public {
    albosAddress = AlbosToken(msg.sender);
  }

  modifier onlyTeam() {
    require(msg.sender == teamWallet);
    _;
  }

  function viewTeamTokens() public view returns (uint256) {

    if (block.number >= launchBlock.add(monthSeconds.mul(3).div(secsPerBlock))) {
      return uint(28710000000).mul(3).div(10);
    }

    if (block.number >= launchBlock.add(monthSeconds.mul(6).div(secsPerBlock))) {
      return uint(28710000000).mul(65).div(100);
    }

    if (block.number >= launchBlock.add(monthSeconds.mul(9).div(secsPerBlock))) {
      return uint(28710000000);
    }

  }

  function startBlock() external onlyOwner {
    launchBlock = block.number;
  }

  function getTeamTokens(uint256 _tokens) public onlyTeam {
    uint256 tokens = _tokens.mul(10 ** 18);
    require(withdrawTokens.add(tokens) <= viewTeamTokens().mul(10 ** 18));
    albosAddress.transfer(teamWallet, tokens);
    withdrawTokens = withdrawTokens.add(tokens);
  }
}

contract AlbosToken is StandardToken {

  string constant public name = "ALBOS Token";
  string constant public symbol = "ALB";
  uint256 public decimals = 18;
  
  uint256 public INITIAL_SUPPLY = uint256(28710000000).mul(10 ** decimals); // 28,710,000,000 tokens
  uint256 public foundersSupply = uint256(8613000000).mul(10 ** decimals); // 8,613,000,000 tokens
  Founders public foundersAddress;
  
  function AlbosToken() public {
    totalSupply_ = INITIAL_SUPPLY;

    foundersAddress = new Founders();

    balances[foundersAddress] = foundersSupply;
    emit Transfer(address(this), foundersAddress, foundersSupply);

    balances[address(this)] = totalSupply_.sub(foundersSupply);
    emit Transfer(address(this), address(this), totalSupply_.sub(foundersSupply));

    agentAddress = msg.sender;
    staff.push(owner);
    staff.push(agentAddress);
  }
  
  modifier onlyAgent() {
    require(msg.sender == agentAddress || msg.sender == owner);
    _;
  }
  
  function startListing() public onlyOwner {
    require(!listing);
    launchBlock = block.number;
    foundersAddress.startBlock();
    listing = true;
  }
  
  function addPrivateSaleTokens(address sender, uint256 amount) external onlyAgent {
      balances[address(this)] = balances[address(this)].sub(amount);
      balances[sender] = balances[sender].add(amount);
      emit Transfer(address(this), sender, amount);
  }
  
  function addPrivateSaleTokensMulti(address[] sender, uint256[] amount) external onlyAgent {
      require(sender.length > 0 && sender.length == amount.length);
      
      for(uint i = 0; i < sender.length; i++) {
        balances[address(this)] = balances[address(this)].sub(amount[i]);
        balances[sender[i]] = balances[sender[i]].add(amount[i]);
        emit Transfer(address(this), sender[i], amount[i]);
      }
  }
  
  function addPreSaleTokens(address sender, uint256 amount) external onlyAgent {
      preSaleTokens[sender] = preSaleTokens[sender].add(amount);
      
      balances[address(this)] = balances[address(this)].sub(amount);
      balances[sender] = balances[sender].add(amount);
      emit Transfer(address(this), sender, amount);
  }
  
  function addPreSaleTokensMulti(address[] sender, uint256[] amount) external onlyAgent {
      require(sender.length > 0 && sender.length == amount.length);
      
      for(uint i = 0; i < sender.length; i++) {
        preSaleTokens[sender[i]] = preSaleTokens[sender[i]].add(amount[i]);
        balances[address(this)] = balances[address(this)].sub(amount[i]);
        balances[sender[i]] = balances[sender[i]].add(amount[i]);
        emit Transfer(address(this), sender[i], amount[i]);
      }
  }
  
  function addCrowdSaleTokens(address sender, uint256 amount) external onlyAgent {
      crowdSaleTokens[sender] = crowdSaleTokens[sender].add(amount);
      
      balances[address(this)] = balances[address(this)].sub(amount);
      balances[sender] = balances[sender].add(amount);
      emit Transfer(address(this), sender, amount);
  }

  function addCrowdSaleTokensMulti(address[] sender, uint256[] amount) external onlyAgent {
      require(sender.length > 0 && sender.length == amount.length);
      
      for(uint i = 0; i < sender.length; i++) {
        crowdSaleTokens[sender[i]] = crowdSaleTokens[sender[i]].add(amount[i]);
        balances[address(this)] = balances[address(this)].sub(amount[i]);
        balances[sender[i]] = balances[sender[i]].add(amount[i]);
        emit Transfer(address(this), sender[i], amount[i]);
      }
  }
  
  function addFrostTokens(address sender, uint256 amount, uint256 blockTime) external onlyAgent {

      totalFreezeTokens = totalFreezeTokens.add(amount);
      require(totalFreezeTokens <= totalSupply_.mul(2).div(10));

      freezeTokens[sender] = amount;
      freezeTimeBlock[sender] = blockTime;
  }
  
  function addFrostTokensMulti(address[] sender, uint256[] amount, uint256[] blockTime) external onlyAgent {
      require(sender.length > 0 && sender.length == amount.length && amount.length == blockTime.length);

      for(uint i = 0; i < sender.length; i++) {
        totalFreezeTokens = totalFreezeTokens.add(amount[i]);
        freezeTokens[sender[i]] = amount[i];
        freezeTimeBlock[sender[i]] = blockTime[i];
      }
      require(totalFreezeTokens <= totalSupply_.mul(2).div(10));
  }
  
  function transferAgent(address _agent) external onlyOwner {
      agentAddress = _agent;
  }

  function addStaff(address _staff) external onlyOwner {
      staff.push(_staff);
  }

  function killFrost() external onlyOwner {
    freezing = false;
  }
}