pragma solidity ^0.4.16;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
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


/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) constant returns (uint256);
  function transfer(address to, uint256 value) returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}


/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances. 
 */
contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) returns (bool) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of. 
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) constant returns (uint256 balance) {
    return balances[_owner];
  }

}

contract BurnableToken is BasicToken {

    event Burn(address indexed burner, uint256 value);

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(address burner, uint256 _value) public {
        require(_value <= balances[burner]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[burner] = balances[burner].sub(_value);
        totalSupply = totalSupply.sub(_value);
        Burn(burner, _value);
    }
}

/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) constant returns (uint256);
  function transferFrom(address from, address to, uint256 value) returns (bool);
  function approve(address spender, uint256 value) returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BurnableToken {

  mapping (address => mapping (address => uint256)) allowed;

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amout of tokens to be transfered
   */
  function transferFrom(address _from, address _to, uint256 _value) returns (bool) {
    var _allowance = allowed[_from][msg.sender];

    // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
    // require (_value <= _allowance);

    balances[_to] = balances[_to].add(_value);
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = _allowance.sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) returns (bool) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still avaible for the spender.
   */
  function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

}

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
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

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
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
   * @dev modifier to allow actions only when the contract IS paused
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev modifier to allow actions only when the contract IS NOT paused
   */
  modifier whenPaused {
    require(paused);
    _;
  }

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  function pause() onlyOwner whenNotPaused returns (bool) {
    paused = true;
    Pause();
    return true;
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  function unpause() onlyOwner whenPaused returns (bool) {
    paused = false;
    Unpause();
    return true;
  }
}

/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */

contract MintableToken is StandardToken, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  bool public mintingFinished = false;

  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will recieve the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner returns (bool) {
    mintingFinished = true;
    MintFinished();
    return true;
  }
}

/**
 * @title token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */
 
contract RubusFundToken is StandardToken, Ownable {

  string public name = "Rubus Fund Token";
  uint8 public decimals = 0;
  string public symbol = "RFT";
  
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  bool public mintingFinished = false;

  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will recieve the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner returns (bool) {
    mintingFinished = true;
    MintFinished();
    return true;
  }

}

contract RubusFundCrowdsale is Ownable, Pausable {
  using SafeMath for uint256;

  RubusFundToken public token;

  mapping(address => uint256) public tokenBalance;
  uint256 public tokenSupply;
  uint256 public queueTokens;
  address[] public array;

  uint256 justOne = 1000000000000000000;
  uint256 justHalf = 1600000000000000000;
  uint256 justTwo = 2000000000000000000;
  
  address public moneyWallet = 0x613A47Bae5034Dd48860B20c2C9472c8e8C590C6;
  uint256 public commission = 10; //20

  function RubusFundCrowdsale() payable {
    token = new RubusFundToken();
  }

  function () payable {
    deposit(msg.sender);
  }

  function deposit(address buyer) whenNotPaused() payable {
    require(buyer != 0x0);

    uint256 tokens = msg.value;

    token.mint(buyer, tokens);
    tokenBalance[buyer] = tokenBalance[buyer].add(tokens);
    tokenSupply = tokenSupply.add(tokens);
    
    moneyWallet.send(tokens.div(100).mul(commission));
  }

  function queue(uint _tokens) whenNotPaused() public {
      
    require(_tokens <= tokenBalance[msg.sender]);

    uint256 tokens = _tokens;
    queueTokens = _tokens.add(queueTokens);

    // Добавляем в массив адреса за токены
    while (tokens > 0) {
        array.push(msg.sender);
        tokens = tokens.sub(justOne);
        if (tokens == 0) {
            while (queueTokens > justTwo) {
                mainLogic();
                # if (queueTokens == justTwo) {
                #     mainLogic();
                # }
            }
            if (queueTokens == justTwo) {
                mainLogic();
            }
        }
    }
    
    //сжечь реальных токена
    token.burn(msg.sender, tokens);
    tokenBalance[msg.sender] = tokenBalance[msg.sender].sub(tokens);
    tokenSupply = tokenSupply.sub(tokens);

  }
  
    function mainLogic() {
        // Отправление денег первому в массиве
        if (array[0].send(justHalf)) {
            // Удаление первого из массива
            if (0 >= array.length) return;
            for (uint i = 0; i<array.length-1; i++){
                 array[i] = array[i+1];
            }
            delete array[array.length-1];
            array.length--;
            // // Уменьшить queueSupply and tokenSupply на 2
            queueTokens = queueTokens.sub(justTwo);
        }
    }
  
    // Владелец может забрать все деньги
    function moneyBack() onlyOwner {
         owner.send(this.balance);
    }
  
     // Возвращает строку по ее индексу в массиве с 0
    function getLineByIndex(uint index) constant returns (address) {
        if(index >= 0) {
            return array[index];
        } else {
            return 0x0;
        }
    }
    
    // Возвращает последнюю строку
    function getLastLine() constant returns (address) {
        return array[array.length-1];
    }
    
    // Установка новой коммиссии, если 20% => вводить просто число 20
    function setCommission(uint256 _commission) {
        commission = _commission;
    }
    
    // Возвращает кол-во строк
    function getLinesCount() constant returns (uint) {
        return array.length;
    }
  
}
// Token name
// MetaMask? Interface?
// Decimals!!!
// Check All functions



// Человек 1 купил один токен за 1 эфир.
// Человек 2 купил один токен за 1 эфир.
// Человек 3 купил три токена за 3 эфира.
// Человек 4 купил 20 токенов за 20 эфиров.

// 1.1. Человек 1 вызывает функцию и ставит значение один (он в очереди первый, и его адрес записывается в очередь один раз).
// На контракте один токен.

// 2.2. Человек 2 вызывает функцию и ставит значение один (его адрес записывается в очередь). 
// На контракте два токена. Человеку 1 отправляется 1,6 эфира. Адрес человека 1 уходит из очереди, 
// а адрес человека 2 становится первым. Можно сделать чтобы эти два токена сгорали, если они сгорают, то на контракте снова 0.

// 3.3. Человек 3 вызывает функцию и ставит значение 3. На контракт поступают три токена. 
// Адрес человека 3 записывается в очередь три раза. Если предыдущие токены сгорали, то на контракте 3 токена, 
// соответственно Человеку 2 отправляются 1,6 эфира, а два токена сгорают. На контракте остается 1 токен.

// 4.4. Человек 4 вызывает функцию и ставит значение 20. На контракт поступают 20 токенов, 
// а адрес Человека 4 записывается в очередь 20 раз. 
// Мы имеем на контракте 21 токен и первые три адреса Человека 3 и 20 адресов Человека 4 в очереди. 
// Соответственно Человеку 3 отправляется три раза по 1,6 эфира, его три адреса уходят из очереди, а 6 токенов сгорает. 
// Далее остается только 20 адресов Человека 4, а на контракте остается 21-6=15 токенов, 
// соответственно Человеку 4 отправляется 7*1,6 эфира, 7 адресов Человека 4 уходят из очереди и 14 токенов сгорает.

// По итогу мы будем иметь на контракте 13 адресов Человека 4 и один токен.  
