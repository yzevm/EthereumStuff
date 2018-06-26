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
    emit Pause();
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused public {
    paused = false;
    emit Unpause();
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
    
  mapping (address => uint256) balances;
  uint256 totalSupply_;
  mapping (address => uint256) public threeMonVesting;
  mapping (address => uint256) public bonusVesting;
  uint256 public launchBlock = 999999999999999999999999999999;
  uint256 constant public monthSeconds = 2592000;
  uint256 constant public secsPerBlock = 15; // 1 block per 15 seconds
  bool public launch = false;
  
  function totalSupply() public view returns (uint256) {
    return totalSupply_;
  }

  modifier afterLaunch() {
    require(block.number >= launchBlock || msg.sender == owner);
    _;
  }
  
  function checkVesting(address sender) public view returns (uint256) {
      if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(6))) {
          return balances[sender];
      } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(3))) {
          return balances[sender].sub(bonusVesting[sender]);
      } else {
          return balances[sender].sub(threeMonVesting[sender]).sub(bonusVesting[sender]);
      }
  }
  
  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) afterLaunch public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);
    require(_value <= checkVesting(msg.sender));

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
  function burn(uint256 _value) afterLaunch public {
    require(_value <= balances[msg.sender]);
    require(_value <= checkVesting(msg.sender));
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

  function transferFrom(address _from, address _to, uint256 _value) afterLaunch public returns (bool) {
    
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);
    require(_value <= checkVesting(_from));

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

contract InstaToken is StandardToken {

  string constant public name = "INSTA";
  string constant public symbol = "INSTA";
  uint256 constant public decimals = 18;

  address constant public partnersWallet = 0x4092678e4E78230F46A1534C0fbc8fA39780892B; // change
  uint256 public partnersPart = uint256(200000000).mul(10 ** decimals); // 20
  
  address constant public foundersWallet = 0x6748F50f686bfbcA6Fe8ad62b22228b87F31ff2b; // change
  uint256 public foundersPart = uint256(200000000).mul(10 ** decimals); // 20
  
  address constant public treasuryWallet = 0xEa11755Ae41D889CeEc39A63E6FF75a02Bc1C00d; // change
  uint256 public treasuryPart = uint256(150000000).mul(10 ** decimals); // 15
  
  uint256 public salePart = uint256(400000000).mul(10 ** decimals); // 40
  
  address constant public devWallet = 0x39Bb259F66E1C59d5ABEF88375979b4D20D98022; // change
  uint256 public devPart = uint256(50000000).mul(10 ** decimals); // 5

  uint256 public INITIAL_SUPPLY = uint256(1000000000).mul(10 ** decimals); // 1 000 000 000 tokens
    
  uint256 public foundersWithdrawTokens = 0;
  uint256 public partnersWithdrawTokens = 0;

  function InstaToken() public {
    totalSupply_ = INITIAL_SUPPLY;

    balances[msg.sender] = salePart;
    emit Transfer(this, msg.sender, salePart);
    
    balances[devWallet] = devPart;
    emit Transfer(this, devWallet, devPart);
    
    balances[treasuryWallet] = treasuryPart;
    emit Transfer(this, treasuryWallet, treasuryPart);
    
    balances[address(this)] = INITIAL_SUPPLY.sub(treasuryPart.add(devPart).add(salePart));
    emit Transfer(this, treasuryWallet, treasuryPart);
  }
  
  function setLaunchBlock() public onlyOwner {
    require(!launch);
    launchBlock = block.number.add(monthSeconds.div(secsPerBlock).div(2));
    launch = true;
  }
  
  modifier onlyFounders() {
    require(msg.sender == foundersWallet);
    _;
  }
  
  modifier onlyPartners() {
    require(msg.sender == partnersWallet);
    _;
  }
  
  function viewFoundersTokens() public view returns (uint256) {
    if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(9))) {
      return 200000000;
    } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(6))) {
      return 140000000;
    } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(3))) {
      return 80000000;
    } else if (block.number >= launchBlock) {
      return 20000000;
    }
  }
  
  function viewPartnersTokens() public view returns (uint256) {
    if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(9))) {
      return 200000000;
    } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(6))) {
      return 140000000;
    } else if (block.number >= launchBlock.add(monthSeconds.div(secsPerBlock).mul(3))) {
      return 80000000;
    } else if (block.number >= launchBlock) {
      return 20000000;
    }
  }
  
  function getFoundersTokens(uint256 _tokens) public onlyFounders {
    uint256 tokens = _tokens.mul(10 ** decimals);
    require(foundersWithdrawTokens.add(tokens) <= viewFoundersTokens().mul(10 ** decimals));
    transfer(foundersWallet, tokens);
    emit Transfer(this, foundersWallet, tokens);
    foundersWithdrawTokens = foundersWithdrawTokens.add(tokens);
  }
  
  function getPartnersTokens(uint256 _tokens) public onlyPartners {
    uint256 tokens = _tokens.mul(10 ** decimals);
    require(partnersWithdrawTokens.add(tokens) <= viewPartnersTokens().mul(10 ** decimals));
    transfer(partnersWallet, tokens);
    emit Transfer(this, partnersWallet, tokens);
    partnersWithdrawTokens = partnersWithdrawTokens.add(tokens);
  }

  function addBonusTokens(address sender, uint256 amount) external onlyOwner {
      bonusVesting[sender] = bonusVesting[sender].add(amount);
  }
  
  function freezeTokens(address sender, uint256 amount) external onlyOwner {
      threeMonVesting[sender] = threeMonVesting[sender].add(amount);
  }
}

contract InstaPresale is Pausable {
    using SafeMath for uint256;

    InstaToken public tokenReward;
    uint256 public stage = 0;
    uint256 public usdRaised = 0;
    uint256 public ETHUSD = 500;
    uint256 public tokenPricePerUSD = 5; // 0.05 usd
    uint256 public saleEndDate = 6404200; // 30 September 2018
    mapping (address => bool) public whiteList;
    address public agent;
    address public multiSig;
    event Transfer(address indexed from, address indexed to, uint256 value);
    event VestTokens(address sender, uint256 value);

    function InstaPresale(address _tokenReward, address _multiSig) public {
        tokenReward = InstaToken(_tokenReward);
        agent = msg.sender;
        multiSig = _multiSig;
    }
    
    modifier onlyAgent() {
        require(msg.sender == owner || msg.sender == agent);
        _;
    }
    
    function () public payable {
        buy(msg.sender);
    }

    function getBonus() public view returns (uint256) {
        if (stage == 0) return 130;
        else if (stage == 1) return 120;
        else if (stage == 2) return 110;
        else return 100;
    }
    
    function getMinimal() public view returns (uint256) {
        if (stage == 0) return 10;
        else if (stage == 1) return 5;
        else if (stage == 2) return 3;
        else return 1;
    }
    
    function updateStage() internal {
        if (usdRaised >= uint(19999000).div(10 ** uint256(tokenReward.decimals())) && block.number >= saleEndDate) {
            tokenReward.setLaunchBlock();
            tokenReward.burn(tokenReward.balanceOf(address(this)));
        } else if (usdRaised >= uint(15000000).mul(10 ** uint256(tokenReward.decimals()))) stage = 3;
        else if (usdRaised >= uint(8000000).mul(10 ** uint256(tokenReward.decimals()))) stage = 2;
        else if (usdRaised >= uint(3000000).mul(10 ** uint256(tokenReward.decimals()))) stage = 1;
        else stage = 0;
    }

    function buy(address buyer) whenNotPaused public payable {
        require(buyer != address(0));
        require(msg.value >= getMinimal().mul(10 ** uint256(tokenReward.decimals())));
        require(whiteList[buyer] == true && stage == 3);
        
        uint256 tokens = msg.value.mul(ETHUSD).mul(getBonus()).mul(tokenPricePerUSD).div(10000);
        tokenReward.transfer(buyer, tokens);
        
        uint256 receivedDollars = msg.value.mul(ETHUSD);
        usdRaised = usdRaised.add(receivedDollars);

        updateStage();
        multiSig.transfer(msg.value);
    }

    function startMainICO() onlyOwner public {
      stage = 3;
    }

    function updatePrice(uint256 _ETHUSD) onlyAgent public {
        ETHUSD = _ETHUSD;
    }

    function transferAgent(address _agent) onlyOwner public {
        agent = _agent;
    }

    function finishMainICO() onlyOwner public {
        tokenReward.setLaunchBlock();
        tokenReward.burn(tokenReward.balanceOf(address(this)));
    }

    function addToWhiteList(address senders, bool _meaning) onlyAgent public {
       whiteList[senders] = _meaning;
    }
    
    function addToWhiteListMulti(address[] senders) onlyAgent public {
      for (uint i = 0; i < senders.length; i++) {
          whiteList[senders[i]] = true;
      }
    }

    function transferTokens(address senders, uint256 amounts) onlyAgent public {
      require(senders != address(0));
      require(amounts.mul(tokenPricePerUSD).div(ETHUSD).div(100) >= getMinimal().mul(10 ** uint256(tokenReward.decimals())));
      uint256 receivedDollars = amounts.mul(tokenPricePerUSD).div(100);
      usdRaised = usdRaised.add(receivedDollars);

      if (stage == 1 || stage == 2) {
        uint256 frostTokens = amounts.div(2);
        tokenReward.freezeTokens(senders, frostTokens);
        emit VestTokens(senders, frostTokens);
      }

      uint256 totalAmount = amounts.mul(getBonus()).div(100);
      uint256 bonus = totalAmount.sub(amounts);
      tokenReward.addBonusTokens(senders, bonus);

      tokenReward.transfer(senders, totalAmount);
      emit Transfer(address(this), senders, totalAmount);

      updateStage();
    }
}

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWallet {

    uint constant public MAX_OWNER_COUNT = 50;

    event Confirmation(address indexed sender, uint indexed transactionId);
    event Revocation(address indexed sender, uint indexed transactionId);
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    event Deposit(address indexed sender, uint value);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint required);

    mapping (uint => Transaction) public transactions;
    mapping (uint => mapping (address => bool)) public confirmations;
    mapping (address => bool) public isOwner;
    address[] public owners;
    uint public required;
    uint public transactionCount;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
    }

    modifier onlyWallet() {
        if (msg.sender != address(this))
            throw;
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        if (isOwner[owner])
            throw;
        _;
    }

    modifier ownerExists(address owner) {
        if (!isOwner[owner])
            throw;
        _;
    }

    modifier transactionExists(uint transactionId) {
        if (transactions[transactionId].destination == 0)
            throw;
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        if (!confirmations[transactionId][owner])
            throw;
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        if (confirmations[transactionId][owner])
            throw;
        _;
    }

    modifier notExecuted(uint transactionId) {
        if (transactions[transactionId].executed)
            throw;
        _;
    }

    modifier notNull(address _address) {
        if (_address == 0)
            throw;
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        if (   ownerCount > MAX_OWNER_COUNT
            || _required > ownerCount
            || _required == 0
            || ownerCount == 0)
            throw;
        _;
    }

    /// @dev Fallback function allows to deposit ether.
    function()
        payable
    {
        if (msg.value > 0)
            Deposit(msg.sender, msg.value);
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners and required number of confirmations.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    function MultiSigWallet(address[] _owners, uint _required)
        public
        validRequirement(_owners.length, _required)
    {
        for (uint i=0; i<_owners.length; i++) {
            if (isOwner[_owners[i]] || _owners[i] == 0)
                throw;
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;
    }

    /// @dev Allows to add a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of new owner.
    function addOwner(address owner)
        public
        onlyWallet
        ownerDoesNotExist(owner)
        notNull(owner)
        validRequirement(owners.length + 1, required)
    {
        isOwner[owner] = true;
        owners.push(owner);
        OwnerAddition(owner);
    }

    /// @dev Allows to remove an owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner.
    function removeOwner(address owner)
        public
        onlyWallet
        ownerExists(owner)
    {
        isOwner[owner] = false;
        for (uint i=0; i<owners.length - 1; i++)
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        owners.length -= 1;
        if (required > owners.length)
            changeRequirement(owners.length);
        OwnerRemoval(owner);
    }

    /// @dev Allows to replace an owner with a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner to be replaced.
    /// @param owner Address of new owner.
    function replaceOwner(address owner, address newOwner)
        public
        onlyWallet
        ownerExists(owner)
        ownerDoesNotExist(newOwner)
    {
        for (uint i=0; i<owners.length; i++)
            if (owners[i] == owner) {
                owners[i] = newOwner;
                break;
            }
        isOwner[owner] = false;
        isOwner[newOwner] = true;
        OwnerRemoval(owner);
        OwnerAddition(newOwner);
    }

    /// @dev Allows to change the number of required confirmations. Transaction has to be sent by wallet.
    /// @param _required Number of required confirmations.
    function changeRequirement(uint _required)
        public
        onlyWallet
        validRequirement(owners.length, _required)
    {
        required = _required;
        RequirementChange(_required);
    }

    /// @dev Allows an owner to submit and confirm a transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function submitTransaction(address destination, uint value, bytes data)
        public
        returns (uint transactionId)
    {
        transactionId = addTransaction(destination, value, data);
        confirmTransaction(transactionId);
    }

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(uint transactionId)
        public
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionId Transaction ID.
    function revokeConfirmation(uint transactionId)
        public
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        Revocation(msg.sender, transactionId);
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
        public
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Transaction tx = transactions[transactionId];
            tx.executed = true;
            if (tx.destination.call.value(tx.value)(tx.data))
                Execution(transactionId);
            else {
                ExecutionFailure(transactionId);
                tx.executed = false;
            }
        }
    }

    /// @dev Returns the confirmation status of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Confirmation status.
    function isConfirmed(uint transactionId)
        public
        constant
        returns (bool)
    {
        uint count = 0;
        for (uint i=0; i<owners.length; i++) {
            if (confirmations[transactionId][owners[i]])
                count += 1;
            if (count == required)
                return true;
        }
    }

    /*
     * Internal functions
     */
    /// @dev Adds a new transaction to the transaction mapping, if transaction does not exist yet.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function addTransaction(address destination, uint value, bytes data)
        internal
        notNull(destination)
        returns (uint transactionId)
    {
        transactionId = transactionCount;
        transactions[transactionId] = Transaction({
            destination: destination,
            value: value,
            data: data,
            executed: false
        });
        transactionCount += 1;
        Submission(transactionId);
    }

    /*
     * Web3 call functions
     */
    /// @dev Returns number of confirmations of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Number of confirmations.
    function getConfirmationCount(uint transactionId)
        public
        constant
        returns (uint count)
    {
        for (uint i=0; i<owners.length; i++)
            if (confirmations[transactionId][owners[i]])
                count += 1;
    }

    /// @dev Returns total number of transactions after filers are applied.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Total number of transactions after filters are applied.
    function getTransactionCount(bool pending, bool executed)
        public
        constant
        returns (uint count)
    {
        for (uint i=0; i<transactionCount; i++)
            if (   pending && !transactions[i].executed
                || executed && transactions[i].executed)
                count += 1;
    }

    /// @dev Returns list of owners.
    /// @return List of owner addresses.
    function getOwners()
        public
        constant
        returns (address[])
    {
        return owners;
    }

    /// @dev Returns array with owner addresses, which confirmed transaction.
    /// @param transactionId Transaction ID.
    /// @return Returns array of owner addresses.
    function getConfirmations(uint transactionId)
        public
        constant
        returns (address[] _confirmations)
    {
        address[] memory confirmationsTemp = new address[](owners.length);
        uint count = 0;
        uint i;
        for (i=0; i<owners.length; i++)
            if (confirmations[transactionId][owners[i]]) {
                confirmationsTemp[count] = owners[i];
                count += 1;
            }
        _confirmations = new address[](count);
        for (i=0; i<count; i++)
            _confirmations[i] = confirmationsTemp[i];
    }

    /// @dev Returns list of transaction IDs in defined range.
    /// @param from Index start position of transaction array.
    /// @param to Index end position of transaction array.
    /// @param pending Include pending transactions.
    /// @param executed Include executed transactions.
    /// @return Returns array of transaction IDs.
    function getTransactionIds(uint from, uint to, bool pending, bool executed)
        public
        constant
        returns (uint[] _transactionIds)
    {
        uint[] memory transactionIdsTemp = new uint[](transactionCount);
        uint count = 0;
        uint i;
        for (i=0; i<transactionCount; i++)
            if (   pending && !transactions[i].executed
                || executed && transactions[i].executed)
            {
                transactionIdsTemp[count] = i;
                count += 1;
            }
        _transactionIds = new uint[](to - from);
        for (i=from; i<to; i++)
            _transactionIds[i - from] = transactionIdsTemp[i];
    }
}