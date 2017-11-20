pragma solidity ^0.4.11;


import './MintableToken.sol';

contract AwesomeToken is MintableToken {

  string public name = "Awesome Token";
  uint8 public decimals = 18;
  string public symbol = "AT";

}
