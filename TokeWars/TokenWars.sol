
pragma solidity ^0.4.11;

contract Ownable {
  address public owner;

  function Ownable() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

}

contract ERC721 {
    function totalSupply() public view returns (uint256 total);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function ownerOf(uint256 _tokenId) external view returns (address owner);
    function approve(address _to, uint256 _tokenId) external;
    function transfer(address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);
}

contract KittyAccessControl {

    event ContractUpgrade(address newContract);

    address public ceoAddress = 0x3a7d6Aac6a70f7ABc581CAE4382381238f66b151;
    address public cfoAddress = 0x3a7d6Aac6a70f7ABc581CAE4382381238f66b151;
    address public cooAddress = 0x3a7d6Aac6a70f7ABc581CAE4382381238f66b151;

    bool public paused = false;

    modifier onlyCEO() {
        require(msg.sender == ceoAddress);
        _;
    }

    modifier onlyCFO() {
        require(msg.sender == cfoAddress);
        _;
    }

    modifier onlyCOO() {
        require(msg.sender == cooAddress);
        _;
    }

    modifier onlyCLevel() {
        require(msg.sender == cooAddress || msg.sender == ceoAddress || msg.sender == cfoAddress);
        _;
    }

    modifier whenNotPaused() {
        require(!paused);
        _;
    }

    modifier whenPaused {
        require(paused);
        _;
    }

}

contract KittyBase is KittyAccessControl {
    event Birth(address owner, uint256 kittyId, uint256 matronId, uint256 sireId, uint256 genes);
    event Transfer(address from, address to, uint256 tokenId);

    struct Kitty {
        uint256 genes;
        uint64 birthTime;
        uint64 cooldownEndBlock;
        uint32 matronId;
        uint32 sireId;
        uint32 siringWithId;
        uint16 cooldownIndex;
        uint16 generation;
        uint16 level;
        uint16 winCount;
    }
    uint32[14] public cooldowns = [
        uint32(1 minutes),
        uint32(2 minutes),
        uint32(5 minutes),
        uint32(10 minutes),
        uint32(30 minutes),
        uint32(1 hours),
        uint32(2 hours),
        uint32(4 hours),
        uint32(8 hours),
        uint32(16 hours),
        uint32(1 days),
        uint32(2 days),
        uint32(4 days),
        uint32(7 days)
    ];
    
    // от рождения среднее арифметическое от показателя родителей
    uint32[10] public strength = [111, 122, 133, 144, 100, 166, 177, 188, 199, 200]; 

    uint256 public secondsPerBlock = 30;
    Kitty[] kitties;
    mapping (uint256 => address) public kittyIndexToOwner;
    mapping (address => uint256) ownershipTokenCount;
    mapping (uint256 => address) public kittyIndexToApproved;
    mapping (uint256 => address) public sireAllowedToAddress;
    SaleClockAuction public saleAuction;
    SiringClockAuction public siringAuction;
    FightingClockAuction public fightingAuction;

    function _transfer(address _from, address _to, uint256 _tokenId) internal {
        ownershipTokenCount[_to]++;
        kittyIndexToOwner[_tokenId] = _to;
        if (_from != address(0)) {
            ownershipTokenCount[_from]--;
            delete sireAllowedToAddress[_tokenId];
            delete kittyIndexToApproved[_tokenId];
        }
        Transfer(_from, _to, _tokenId);
    }

    function _createKitty(uint256 _matronId, uint256 _sireId, uint256 _generation, uint256 _genes, address _owner) internal returns (uint) {
        require(_matronId == uint256(uint32(_matronId)));
        require(_sireId == uint256(uint32(_sireId)));
        require(_generation == uint256(uint16(_generation)));
        uint16 cooldownIndex = uint16(_generation / 2);
        if (cooldownIndex > 13) {
            cooldownIndex = 13;
        }

        Kitty memory _kitty = Kitty({
            genes: _genes,
            birthTime: uint64(now),
            cooldownEndBlock: 0,
            matronId: uint32(_matronId),
            sireId: uint32(_sireId),
            siringWithId: 0,
            cooldownIndex: cooldownIndex,
            generation: uint16(_generation),
            level: 1,
            winCount: 0
        });
        uint256 newKittenId = kitties.push(_kitty) - 1;
        require(newKittenId == uint256(uint32(newKittenId)));
        Birth(_owner, newKittenId, uint256(_kitty.matronId), uint256(_kitty.sireId), _kitty.genes);
        _transfer(0, _owner, newKittenId);

        return newKittenId;
    }

}

contract KittyOwnership is KittyBase, ERC721 {

    string public constant name = "CryptoKitties";
    string public constant symbol = "CK";

    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return kittyIndexToOwner[_tokenId] == _claimant;
    }

    function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return kittyIndexToApproved[_tokenId] == _claimant;
    }

    function _approve(uint256 _tokenId, address _approved) internal {
        kittyIndexToApproved[_tokenId] = _approved;
    }

    function balanceOf(address _owner) public view returns (uint256 count) {
        return ownershipTokenCount[_owner];
    }

    function transfer(address _to, uint256 _tokenId) external whenNotPaused {
        require(_to != address(0));
        require(_to != address(this));
        require(_to != address(saleAuction));
        require(_to != address(siringAuction));
        require(_to != address(fightingAuction));
        require(_owns(msg.sender, _tokenId));
        _transfer(msg.sender, _to, _tokenId);
    }

    function approve(address _to, uint256 _tokenId) external whenNotPaused {
        require(_owns(msg.sender, _tokenId));
        _approve(_tokenId, _to);
        Approval(msg.sender, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external whenNotPaused {
        require(_to != address(0));
        require(_to != address(this));
        require(_approvedFor(msg.sender, _tokenId));
        require(_owns(_from, _tokenId));
        _transfer(_from, _to, _tokenId);
    }

    function totalSupply() public view returns (uint) {
        return kitties.length - 1;
    }

    function ownerOf(uint256 _tokenId) external view returns (address owner) {
        owner = kittyIndexToOwner[_tokenId];
        require(owner != address(0));
    }

    function tokensOfOwner(address _owner) external view returns(uint256[] ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);

        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalCats = totalSupply();
            uint256 resultIndex = 0;
            uint256 catId;

            for (catId = 1; catId <= totalCats; catId++) {
                if (kittyIndexToOwner[catId] == _owner) {
                    result[resultIndex] = catId;
                    resultIndex++;
                }
            }

            return result;
        }
    }
}

contract KittyBreeding is KittyOwnership {

    event Pregnant(address owner, uint256 matronId, uint256 sireId, uint256 cooldownEndBlock);

    uint256 public autoBirthFee = 2 finney;
    uint256 public boosterFee = 2 finney;
    uint256 public betLevel = 6;
    uint256 public pregnantKitties;

    function _isReadyToBreed(Kitty _kit) internal view returns (bool) {
        return (_kit.siringWithId == 0) && (_kit.cooldownEndBlock <= uint64(block.number));
    }

    function _isSiringPermitted(uint256 _sireId, uint256 _matronId) internal view returns (bool) {
        address matronOwner = kittyIndexToOwner[_matronId];
        address sireOwner = kittyIndexToOwner[_sireId];
        return (matronOwner == sireOwner || sireAllowedToAddress[_sireId] == matronOwner);
    }

    function _triggerCooldown(bool booster, Kitty storage _kitten, bool fight, bool win) internal {

        if (booster == true) {
            _kitten.cooldownEndBlock = uint64(block.number);
        } else {

            if (fight == true) {

                if (win == true) {
                    _kitten.cooldownEndBlock = uint64((cooldowns[6]/secondsPerBlock) + block.number);
                }

                if (win == false) {
                    _kitten.cooldownEndBlock = uint64((cooldowns[9]/secondsPerBlock) + block.number);
                }
                
            } else {
                _kitten.cooldownEndBlock = uint64((cooldowns[_kitten.cooldownIndex]/secondsPerBlock) + block.number);

                if (_kitten.cooldownIndex < 13) {
                    _kitten.cooldownIndex += 1;
                }
            }
        }

    }

    function approveSiring(address _addr, uint256 _sireId) external whenNotPaused {
        require(_owns(msg.sender, _sireId));
        sireAllowedToAddress[_sireId] = _addr;
    }

    function setAutoBirthFee(uint256 val) external onlyCOO {
        autoBirthFee = val;
    }

    function _isReadyToGiveBirth(Kitty _matron) private view returns (bool) {
        return (_matron.siringWithId != 0) && (_matron.cooldownEndBlock <= uint64(block.number));
    }

    function isReadyToBreed(uint256 _kittyId) public view returns (bool) {
        require(_kittyId > 0);
        Kitty storage kit = kitties[_kittyId];
        return _isReadyToBreed(kit);
    }

    function isPregnant(uint256 _kittyId) public view returns (bool) {
        require(_kittyId > 0);
        return kitties[_kittyId].siringWithId != 0;
    }

    function _isValidMatingPair(Kitty storage _matron, uint256 _matronId, Kitty storage _sire, uint256 _sireId) private view returns(bool) {
        if (_matronId == _sireId) {
            return false;
        }

        if (_matron.matronId == _sireId || _matron.sireId == _sireId) {
            return false;
        }
        if (_sire.matronId == _matronId || _sire.sireId == _matronId) {
            return false;
        }

        if (_sire.matronId == 0 || _matron.matronId == 0) {
            return true;
        }

        if (_sire.matronId == _matron.matronId || _sire.matronId == _matron.sireId) {
            return false;
        }
        if (_sire.sireId == _matron.matronId || _sire.sireId == _matron.sireId) {
            return false;
        }
        return true;
    }

    function _canBreedWithViaAuction(uint256 _matronId, uint256 _sireId) internal view returns (bool) {
        Kitty storage matron = kitties[_matronId];
        Kitty storage sire = kitties[_sireId];
        return _isValidMatingPair(matron, _matronId, sire, _sireId);
    }

    function canBreedWith(uint256 _matronId, uint256 _sireId) external view returns(bool) {
        require(_matronId > 0);
        require(_sireId > 0);
        Kitty storage matron = kitties[_matronId];
        Kitty storage sire = kitties[_sireId];
        return _isValidMatingPair(matron, _matronId, sire, _sireId) && _isSiringPermitted(_sireId, _matronId);
    }

    function _breedWith(uint256 _matronId, uint256 _sireId) internal {

        Kitty storage sire = kitties[_sireId];
        Kitty storage matron = kitties[_matronId];

        matron.siringWithId = uint32(_sireId);

        _triggerCooldown(false, sire, false, false);
        _triggerCooldown(false, matron, false, false);

        delete sireAllowedToAddress[_matronId];
        delete sireAllowedToAddress[_sireId];

        pregnantKitties++;

        Pregnant(kittyIndexToOwner[_matronId], _matronId, _sireId, matron.cooldownEndBlock);
    }

    function _fightWith(uint256 _matronId, uint256 _sireId) internal {

        Kitty storage sire = kitties[_sireId];
        Kitty storage matron = kitties[_matronId];

        if (sire.level >= betLevel && matron.level >= betLevel) {

            // bets
            //_triggerCooldown(sire);
            //_triggerCooldown(matron);

            //sire.level++;

            //delete sireAllowedToAddress[_matronId];
            //delete sireAllowedToAddress[_sireId];

        } else {

            if (uint64(strength[sire.genes % 10]) >= uint64(strength[matron.genes % 10])) {
                sire.level++;
                _triggerCooldown(false, sire, true, true);
                _triggerCooldown(false, matron, true, false);
            } else {
                matron.level++;
                _triggerCooldown(false, sire, true, false);
                _triggerCooldown(false, matron, true, true);
            }

            delete sireAllowedToAddress[_matronId];
            delete sireAllowedToAddress[_sireId];

        }

    }

    function takeBooster(uint256 _kittyId) external payable whenNotPaused {
        require(_owns(msg.sender, _kittyId));
        require (msg.value >= boosterFee);

        Kitty storage kittyId = kitties[_kittyId];

        _triggerCooldown(true, kittyId, false, false);
    }

    // for breeding by user
    function breedWithAuto(uint256 _matronId, uint256 _sireId) external payable whenNotPaused {
        require(msg.value >= autoBirthFee);
        require(_owns(msg.sender, _matronId));
        require(_isSiringPermitted(_sireId, _matronId));
        Kitty storage matron = kitties[_matronId];
        require(_isReadyToBreed(matron));
        Kitty storage sire = kitties[_sireId];
        require(_isReadyToBreed(sire));
        require(_isValidMatingPair(matron, _matronId, sire, _sireId));
        _breedWith(_matronId, _sireId);
    }

    function giveBirth(uint256 _matronId) external whenNotPaused returns(uint256) {
        Kitty storage matron = kitties[_matronId];
        require(matron.birthTime != 0);
        require(_isReadyToGiveBirth(matron));

        uint256 sireId = matron.siringWithId;
        Kitty storage sire = kitties[sireId];

        uint16 parentGen = matron.generation;
        if (sire.generation > matron.generation) {
            parentGen = sire.generation;
        }

        uint256 childGenes = uint256(keccak256(matron.genes, sire.genes, matron.cooldownEndBlock - 1));
        
        address owner = kittyIndexToOwner[_matronId];
        uint256 kittenId = _createKitty(_matronId, matron.siringWithId, parentGen + 1, childGenes, owner);
        delete matron.siringWithId;
        pregnantKitties--;
        msg.sender.send(autoBirthFee);
        return kittenId;
    }
}

contract ClockAuctionBase {

    struct Auction {
        address seller;
        uint128 startingPrice;
        uint128 endingPrice;
        uint64 duration;
        uint64 startedAt;
    }

    ERC721 public nonFungibleContract;
    uint256 public ownerCut;
    mapping (uint256 => Auction) tokenIdToAuction;

    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
        return (nonFungibleContract.ownerOf(_tokenId) == _claimant);
    }

    function _escrow(address _owner, uint256 _tokenId) internal {
        nonFungibleContract.transferFrom(_owner, this, _tokenId);
    }

    function _transfer(address _receiver, uint256 _tokenId) internal {
        nonFungibleContract.transfer(_receiver, _tokenId);
    }

    function _addAuction(uint256 _tokenId, Auction _auction) internal {
        require(_auction.duration >= 1 minutes);
        tokenIdToAuction[_tokenId] = _auction;
    }

    function _cancelAuction(uint256 _tokenId, address _seller) internal {
        _removeAuction(_tokenId);
        _transfer(_seller, _tokenId);
    }

    function _bid(uint256 _tokenId, uint256 _bidAmount) internal returns (uint256) {
        Auction storage auction = tokenIdToAuction[_tokenId];

        require(_isOnAuction(auction));
        uint256 price = _currentPrice(auction);
        require(_bidAmount >= price);
        address seller = auction.seller;

        _removeAuction(_tokenId);

        if (price > 0) {
            uint256 auctioneerCut = _computeCut(price);
            uint256 sellerProceeds = price - auctioneerCut;

            seller.transfer(sellerProceeds);
        }

        uint256 bidExcess = _bidAmount - price;
        msg.sender.transfer(bidExcess);

        return price;
    }

    function _removeAuction(uint256 _tokenId) internal {
        delete tokenIdToAuction[_tokenId];
    }

    function _isOnAuction(Auction storage _auction) internal view returns (bool) {
        return (_auction.startedAt > 0);
    }

    function _currentPrice(Auction storage _auction) internal view returns (uint256) {
        uint256 secondsPassed = 0;

        if (now > _auction.startedAt) {
            secondsPassed = now - _auction.startedAt;
        }

        return _computeCurrentPrice(_auction.startingPrice, _auction.endingPrice, _auction.duration, secondsPassed);
    }

    function _computeCurrentPrice(uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, uint256 _secondsPassed) internal pure returns (uint256) {

        if (_secondsPassed >= _duration) {
            return _endingPrice;
        } else {

            int256 totalPriceChange = int256(_endingPrice) - int256(_startingPrice);
            int256 currentPriceChange = totalPriceChange * int256(_secondsPassed) / int256(_duration);
            int256 currentPrice = int256(_startingPrice) + currentPriceChange;

            return uint256(currentPrice);
        }
    }

    function _computeCut(uint256 _price) internal view returns (uint256) {
        return _price * ownerCut / 10000;
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

  modifier whenPaused {
    require(paused);
    _;
  }

  function pause() onlyOwner whenNotPaused returns (bool) {
    paused = true;
    Pause();
    return true;
  }

  function unpause() onlyOwner whenPaused returns (bool) {
    paused = false;
    Unpause();
    return true;
  }
}

contract ClockAuction is Pausable, ClockAuctionBase {

    function ClockAuction(address _nftAddress, uint256 _cut) public {
        require(_cut <= 10000);
        ownerCut = _cut;

        ERC721 candidateContract = ERC721(_nftAddress);
        nonFungibleContract = candidateContract;
    }

    function withdrawBalance() external {
        address nftAddress = address(nonFungibleContract);
        require(msg.sender == owner || msg.sender == nftAddress);
        bool res = nftAddress.send(this.balance);
    }

    function createAuction(uint256 _tokenId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, address _seller) external whenNotPaused {
        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));
        require(_owns(msg.sender, _tokenId));
        _escrow(msg.sender, _tokenId);
        Auction memory auction = Auction(_seller, uint128(_startingPrice), uint128(_endingPrice), uint64(_duration), uint64(now));
        _addAuction(_tokenId, auction);
    }

    function bid(uint256 _tokenId) external payable whenNotPaused {
        _bid(_tokenId, msg.value);
        _transfer(msg.sender, _tokenId);
    }

    // отменить продажу/спаривание
    function cancelAuction(uint256 _tokenId) external {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        address seller = auction.seller;
        require(msg.sender == seller);
        _cancelAuction(_tokenId, seller);
    }

    function cancelAuctionWhenPaused(uint256 _tokenId) whenPaused onlyOwner external {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        _cancelAuction(_tokenId, auction.seller);
    }

    function getAuction(uint256 _tokenId) external view returns (address seller, uint256 startingPrice, uint256 endingPrice, uint256 duration, uint256 startedAt) {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        return (auction.seller, auction.startingPrice, auction.endingPrice, auction.duration, auction.startedAt);
    }

    function getCurrentPrice(uint256 _tokenId) external view returns (uint256) {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        return _currentPrice(auction);
    }

}

contract FightingClockAuction is ClockAuction {

    bool public isFightingClockAuction = true;

    function FightingClockAuction(address _nftAddr, uint256 _cut) public ClockAuction(_nftAddr, _cut) {}

    // от KittyAuction.createFightingAuction
    function createAuction(uint256 _tokenId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, address _seller) external {

        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));
        require(msg.sender == address(nonFungibleContract));
        _escrow(_seller, _tokenId);
        Auction memory auction = Auction(_seller, uint128(_startingPrice), uint128(_endingPrice), uint64(_duration), uint64(now));
        _addAuction(_tokenId, auction);
    }

    // от KittyAuction.bidOnFightingAuction сделать ставку(?) на бой персонажа с кабинета
    function bid(uint256 _tokenId) external payable {
        require(msg.sender == address(nonFungibleContract));
        address seller = tokenIdToAuction[_tokenId].seller;
        _bid(_tokenId, msg.value);
        _transfer(seller, _tokenId);
    }

}

contract SiringClockAuction is ClockAuction {

    bool public isSiringClockAuction = true;

    function SiringClockAuction(address _nftAddr, uint256 _cut) public ClockAuction(_nftAddr, _cut) {}

    // от KittyAuction.createSiringAuction
    function createAuction(uint256 _tokenId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, address _seller) external {

        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));
        require(msg.sender == address(nonFungibleContract));
        _escrow(_seller, _tokenId);
        Auction memory auction = Auction(_seller, uint128(_startingPrice), uint128(_endingPrice), uint64(_duration), uint64(now));
        _addAuction(_tokenId, auction);
    }

    // от KittyAuction.bidOnSiringAuction сделать ставку(?) на спаривание персонажа с кабинета
    function bid(uint256 _tokenId) external payable {
        require(msg.sender == address(nonFungibleContract));
        address seller = tokenIdToAuction[_tokenId].seller;
        _bid(_tokenId, msg.value);
        _transfer(seller, _tokenId);
    }

}

contract SaleClockAuction is ClockAuction {

    bool public isSaleClockAuction = true;
    uint256 public gen0SaleCount;
    uint256[5] public lastGen0SalePrices;

    function SaleClockAuction(address _nftAddr, uint256 _cut) public ClockAuction(_nftAddr, _cut) {}

    // от KittyAuction.createSaleAuction
    function createAuction(uint256 _tokenId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration, address _seller) external {

        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));
        require(msg.sender == address(nonFungibleContract));
        _escrow(_seller, _tokenId);
        Auction memory auction = Auction(_seller, uint128(_startingPrice), uint128(_endingPrice), uint64(_duration), uint64(now));
        _addAuction(_tokenId, auction);
    }

    // сделать ставку на покупку персонажа с кабинета
    function bid(uint256 _tokenId) external payable {
        address seller = tokenIdToAuction[_tokenId].seller;
        uint256 price = _bid(_tokenId, msg.value);
        _transfer(msg.sender, _tokenId);

        if (seller == address(nonFungibleContract)) {
            lastGen0SalePrices[gen0SaleCount % 5] = price;
            gen0SaleCount++;
        }
    }

    function averageGen0SalePrice() external view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < 5; i++) {
            sum += lastGen0SalePrices[i];
        }
        return sum / 5;
    }
}

contract KittyAuction is KittyBreeding {

    function setSaleAuctionAddress(address _address) external onlyCEO {
        SaleClockAuction candidateContract = SaleClockAuction(_address);
        require(candidateContract.isSaleClockAuction());
        saleAuction = candidateContract;
    }

    function setSiringAuctionAddress(address _address) external onlyCEO {
        SiringClockAuction candidateContract = SiringClockAuction(_address);
        require(candidateContract.isSiringClockAuction());
        siringAuction = candidateContract;
    }

    function setFightinigAuctionAddress(address _address) external onlyCEO {
        FightingClockAuction candidateContract = FightingClockAuction(_address);
        require(candidateContract.isFightingClockAuction());
        fightingAuction = candidateContract;
    }

    // выставить своего кота на продажу
    function createSaleAuction(uint256 _kittyId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) external whenNotPaused {
        require(_owns(msg.sender, _kittyId));
        require(!isPregnant(_kittyId));
        _approve(_kittyId, saleAuction);

        saleAuction.createAuction(_kittyId, _startingPrice, _endingPrice, _duration, msg.sender);
    }

    // выставить своего кота на размножение
    function createSiringAuction( uint256 _kittyId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) external whenNotPaused {
        require(_owns(msg.sender, _kittyId));
        require(isReadyToBreed(_kittyId));
        _approve(_kittyId, siringAuction);

        siringAuction.createAuction(_kittyId, _startingPrice, _endingPrice, _duration, msg.sender);
    }

    // пользователь с кабинета выбирает кота для спаривания
    function bidOnSiringAuction(uint256 _sireId, uint256 _matronId) external payable whenNotPaused {
        require(_owns(msg.sender, _matronId));
        require(isReadyToBreed(_matronId));
        require(_canBreedWithViaAuction(_matronId, _sireId));

        uint256 currentPrice = siringAuction.getCurrentPrice(_sireId);
        require(msg.value >= currentPrice + autoBirthFee);

        siringAuction.bid.value(msg.value - autoBirthFee)(_sireId);
        _breedWith(uint32(_matronId), uint32(_sireId));
    }

    // выставить своего кота на бой
    function createFightingAuction( uint256 _kittyId, uint256 _startingPrice, uint256 _endingPrice, uint256 _duration) external whenNotPaused {
        require(_owns(msg.sender, _kittyId));
        require(isReadyToBreed(_kittyId));
        _approve(_kittyId, fightingAuction);

        fightingAuction.createAuction(_kittyId, _startingPrice, _endingPrice, _duration, msg.sender);
    }

    // пользователь с кабинета выбирает кота для драки
    function bidOnFightingAuction(uint256 _sireId, uint256 _matronId) external payable whenNotPaused {
        require(_owns(msg.sender, _matronId));
        require(isReadyToBreed(_matronId));
        require(_canBreedWithViaAuction(_matronId, _sireId));

        uint256 currentPrice = fightingAuction.getCurrentPrice(_sireId);
        require(msg.value >= currentPrice + autoBirthFee);

        fightingAuction.bid.value(msg.value - autoBirthFee)(_sireId);
        _fightWith(uint32(_matronId), uint32(_sireId));
    }

} 

contract KittyMinting is KittyAuction {

    uint256 public constant PROMO_CREATION_LIMIT = 5000;
    uint256 public constant GEN0_CREATION_LIMIT = 45000;

    uint256 public constant GEN0_STARTING_PRICE = 10 finney;
    uint256 public constant GEN0_AUCTION_DURATION = 1 days;

    uint256 public promoCreatedCount;
    uint256 public gen0CreatedCount;

    function createPromoKitty(uint256 _genes, address _owner) external onlyCOO {
        address kittyOwner = _owner;
        if (kittyOwner == address(0)) {
             kittyOwner = cooAddress;
        }
        // require(promoCreatedCount < PROMO_CREATION_LIMIT);

        promoCreatedCount++;
        _createKitty(0, 0, 0, _genes, kittyOwner);
    }

    function createGen0Auction(uint256 _genes) external onlyCOO {
        // require(gen0CreatedCount < GEN0_CREATION_LIMIT);

        uint256 kittyId = _createKitty(0, 0, 0, _genes, address(this));
        _approve(kittyId, saleAuction);
        saleAuction.createAuction(kittyId, _computeNextGen0Price(), 0, GEN0_AUCTION_DURATION, address(this));
        gen0CreatedCount++;
    }

    function _computeNextGen0Price() internal view returns (uint256) {
        uint256 avePrice = saleAuction.averageGen0SalePrice();
        require(avePrice == uint256(uint128(avePrice)));
        uint256 nextPrice = avePrice + (avePrice / 2);

        if (nextPrice < GEN0_STARTING_PRICE) {
            nextPrice = GEN0_STARTING_PRICE;
        }
        return nextPrice;
    }
}

contract KittyCore is KittyMinting {

    function KittyCore() public {
        paused = false;
        ceoAddress = msg.sender;
        cooAddress = msg.sender;
        _createKitty(0, 0, 0, uint256(-1), address(0));
    }

    function() external payable {
        require(msg.sender == address(saleAuction) || msg.sender == address(siringAuction) || msg.sender == address(fightingAuction));
    }

    function getKitty(uint256 _id) external view returns (bool isGestating, bool isReady, uint256 cooldownIndex, uint256 nextActionAt, uint256 siringWithId, uint256 birthTime, uint256 matronId, uint256 sireId, uint256 generation, uint256 level, uint256 winCount, uint256 genes) {
        Kitty storage kit = kitties[_id];

        isGestating = (kit.siringWithId != 0);
        isReady = (kit.cooldownEndBlock <= block.number);
        cooldownIndex = uint256(kit.cooldownIndex);
        nextActionAt = uint256(kit.cooldownEndBlock);
        siringWithId = uint256(kit.siringWithId);
        birthTime = uint256(kit.birthTime);
        matronId = uint256(kit.matronId);
        sireId = uint256(kit.sireId);
        generation = uint256(kit.generation);
        level = uint256(kit.level);
        winCount = uint256(kit.winCount);
        genes = kit.genes;
    }
    
    function newStrength(uint32[10] _newStrength) onlyCFO {
      uint32[10] memory arrayAmount = _newStrength;
      strength = arrayAmount;
    }

    function withdrawBalance() external onlyCFO {
        uint256 balance = this.balance;
        uint256 subtractFees = (pregnantKitties + 1) * autoBirthFee;

        if (balance > subtractFees) {
            cfoAddress.send(balance - subtractFees);
        }
    }

}