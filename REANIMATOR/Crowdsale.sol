pragma solidity ^0.4.16;

// Из контракта токена, импортируем функцию transfer
interface ReanimatorCoin {
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

  // Функция для смены владельца
  function transferOwnership(address newOwner) onlyOwner {
    if (newOwner != address(0)) {
      owner = newOwner;
    }
  }

}

contract Crowdsale is Ownable {
    using SafeMath for uint256;

    address public moneyWallet = 0x8503AAb7e9178174847302d6D06af5fbfEfcf444; //Кошелек для хранения присланных эфиров
    ReanimatorCoin public tokenReward; // Объявялем переменную для токена

    uint256 public constant startline = 1519653600; // 02/26/2018 @ 2:00pm UTC
    uint256 public constant deadline = 1522072800;  // 03/26/2018 @ 2:00pm UTC
    uint256 public etherUsdPrice = 1370;
    uint256 public minimalUSD = 5;

    event FundTransfer(address backer, uint amount, bool isContribution); // Событие для отслеживания отправки токенов покупателю

    function Crowdsale(address _tokenReward) {
        tokenReward = ReanimatorCoin(_tokenReward); // Присваивается адрес токен
    }

    // Объявляем переменную для стомости токена при цене 1 ETH = 1200 USD = 600 RNM
    function getRate() constant returns (uint256) {
        if      (block.timestamp < startline + 120 hours) return etherUsdPrice; // 120=24*5, 26 февраля 17:00 – 3 марта 17:00, 50% discount
        else if (block.timestamp <= startline + 288 hours) return etherUsdPrice.mul(2).div(3); // 120=24*7, 3 марта 17:01 – 10 марта 17:00, 25% discount
        else if (block.timestamp <= startline + 456 hours) return etherUsdPrice.mul(10).div(17); // 120=24*7, 10 марта 17:01 – 17 марта 17:00, 15% discount
        return etherUsdPrice.div(2); // 17 марта 17:01 – 26 март 17:00, no discount
    }

    function () payable {
        buy(msg.sender); // Вызываем функцию покупки токена
    }

    function buy(address buyer) payable {
        require(buyer != address(0));
        require(msg.value != 0);
        require(msg.value >= minimalUSD.mul(10 ** 18).div(etherUsdPrice)); // Минимальный взнос = minimalUSD(5 usd)
        require(now >= startline); // Не принимаются эфиры до начала ICO

        uint amount = msg.value;
        uint tokens = amount.mul(getRate()); // Получаем число купленных токенов
        tokenReward.transfer(buyer,tokens); // Рассчитываем стоимость и отправляем токены с помощью вызова метода токена
    }

    function transferFund() onlyOwner {
        require(now >= deadline); // Снятие происходит после окончания ICO
        moneyWallet.send(this.balance); // Переводим присланный эфир на кошелек хранения
        FundTransfer(msg.sender, this.balance, true);  // Объявляем событие для передачи токенов
    }

    function updatePrice(uint256 _etherUsdPrice) onlyOwner {
        etherUsdPrice = _etherUsdPrice; // Вставляем актуальную цену ETH к USD (Например, 1300)
    }

    function updateMinimal(uint256 _minimalUSD) onlyOwner {
        minimalUSD = _minimalUSD; // Вставляем актуальную минимальную цену USD (Например, 5)
    }

}
