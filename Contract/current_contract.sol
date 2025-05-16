// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BoulderingGymReview {
    address public owner;

    struct Gym {
        uint256 id;
        string name;
        string location;
        address addedBy;
        uint256 reviewCount;
    }

    struct Review {
        address reviewer;
        uint8 rating; // 1-5 scale
        string reviewText;
        uint256 timestamp;
    }

    uint256 private gymIdCounter;
    mapping(uint256 => Gym) public gyms;
    mapping(uint256 => Review[]) private gymReviews;

    // To help check duplicates efficiently, map keccak256(name + location) => bool
    mapping(bytes32 => bool) private gymExists;

    event GymAdded(
        uint256 indexed gymId,
        string name,
        string location,
        address indexed addedBy
    );
    event ReviewSubmitted(
        uint256 indexed gymId,
        address indexed reviewer,
        uint8 rating,
        string reviewText
    );

    // Make constructor payable to accept ETH if sent on deployment
    constructor() payable {
        owner = msg.sender; // Store contract deployer
    }

    // Add a new gym (with duplicate check)
    function addGym(
        string calldata _name,
        string calldata _location
    ) public payable {
        require(bytes(_name).length > 0, "Gym name cannot be empty");
        require(bytes(_location).length > 0, "Gym location cannot be empty");

        bytes32 gymKey = keccak256(abi.encodePacked(_name, _location));
        require(
            !gymExists[gymKey],
            "Gym with this name and location already exists"
        );

        gymIdCounter++;
        gyms[gymIdCounter] = Gym({
            id: gymIdCounter,
            name: _name,
            location: _location,
            addedBy: msg.sender,
            reviewCount: 0
        });

        gymExists[gymKey] = true;

        emit GymAdded(gymIdCounter, _name, _location, msg.sender);
    }

    // Submit a review for a gym
    function submitReview(
        uint256 _gymId,
        uint8 _rating,
        string calldata _reviewText
    ) public payable {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(bytes(_reviewText).length > 0, "Review text cannot be empty");
        require(gyms[_gymId].id != 0, "Gym does not exist");

        gymReviews[_gymId].push(
            Review({
                reviewer: msg.sender,
                rating: _rating,
                reviewText: _reviewText,
                timestamp: block.timestamp
            })
        );

        gyms[_gymId].reviewCount++;

        emit ReviewSubmitted(_gymId, msg.sender, _rating, _reviewText);
    }

    // Get total gyms count
    function getGymCount() public view returns (uint256) {
        return gymIdCounter;
    }

    // Get all gyms info: returns arrays of ids, names, and locations
    function getAllGyms()
        public
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory locations
        )
    {
        ids = new uint256[](gymIdCounter);
        names = new string[](gymIdCounter);
        locations = new string[](gymIdCounter);

        for (uint256 i = 0; i < gymIdCounter; i++) {
            uint256 gymId = i + 1;
            Gym storage gym = gyms[gymId];
            ids[i] = gymId;
            names[i] = gym.name;
            locations[i] = gym.location;
        }
    }

    // Get reviews for a gym
    function getReviews(uint256 _gymId) public view returns (Review[] memory) {
        require(gyms[_gymId].id != 0, "Gym does not exist");
        return gymReviews[_gymId];
    }

    // Utility function: get contract info
    function getContractInfo()
        public
        view
        returns (
            uint256 currentBlock,
            uint256 timestamp,
            address miner,
            uint256 gasLimit
        )
    {
        return (block.number, block.timestamp, block.coinbase, block.gaslimit);
    }

    // Utility function: check sender and origin
    function checkSender()
        public
        view
        returns (address sender, address origin)
    {
        return (msg.sender, tx.origin);
    }

    // Utility function: hash data input
    function getHash(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(data));
    }
}
