// SPDX-License-Identifier: MIT
// contract address: 0xe2978036e3813bb6a191fbf20f5adacb036facbf
pragma solidity ^0.8.0;

contract BoulderingGymReview {
    address public owner;

    struct Gym {
        uint256 id;
        string name;
        string location;
        address addedBy;
        uint256 reviewCount;
        uint256 totalOverallRating; // sum of overall ratings only
        uint256 meanOverallScore; // average overall rating (totalOverallRating / reviewCount)
        bool removed;
    }

    struct Review {
        address reviewer;
        uint8 cleanliness; // 1-5
        uint8 size; // 1-5
        uint8 difficulty; // 1-5
        uint8 overall; // 1-5
        string reviewText;
        uint256 timestamp;
    }

    uint256 private gymIdCounter;
    mapping(uint256 => Gym) public gyms;
    mapping(uint256 => Review[]) private gymReviews;

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
        uint8 cleanliness,
        uint8 size,
        uint8 difficulty,
        uint8 overall,
        string reviewText
    );
    event GymRemoved(uint256 indexed gymId, address indexed removedBy);

    constructor() payable {
        owner = msg.sender;
    }

    function addGym(
        string calldata _name,
        string calldata _location
    ) public payable {
        require(bytes(_name).length > 0, "Gym name cannot be empty");
        require(bytes(_location).length > 0, "Gym location cannot be empty");

        bytes32 gymKey = keccak256(abi.encodePacked(_name, _location));

        // Check if a gym with the same name and location exists and is NOT removed
        if (gymExists[gymKey]) {
            // Find the gym ID with this key and check removal status
            // Since gymExists only tracks existence, we need to scan gyms to find gym with this key
            // To avoid gas cost, we store gym ID in gymExists mapping instead (mapping(bytes32 => uint256))
            // But since original code doesn't do that, we must scan gyms (not ideal but for demo)

            for (uint256 i = 1; i <= gymIdCounter; i++) {
                Gym storage gym = gyms[i];
                if (
                    !gym.removed &&
                    keccak256(abi.encodePacked(gym.name, gym.location)) ==
                    gymKey
                ) {
                    revert("Gym with this name and location already exists");
                }
            }
        }

        gymIdCounter++;

        gyms[gymIdCounter] = Gym({
            id: gymIdCounter,
            name: _name,
            location: _location,
            addedBy: msg.sender,
            reviewCount: 0,
            totalOverallRating: 0,
            meanOverallScore: 0,
            removed: false
        });

        gymExists[gymKey] = true;

        emit GymAdded(gymIdCounter, _name, _location, msg.sender);
    }

    function removeGym(uint256 _gymId) public {
        Gym storage gym = gyms[_gymId];
        require(gym.id != 0, "Gym does not exist");
        require(!gym.removed, "Gym already removed");
        require(
            msg.sender == gym.addedBy || msg.sender == owner,
            "Not authorized to remove this gym"
        );

        gym.removed = true;

        bytes32 gymKey = keccak256(abi.encodePacked(gym.name, gym.location));
        gymExists[gymKey] = false;

        emit GymRemoved(_gymId, msg.sender);
    }

    function submitReview(
        uint256 _gymId,
        uint8 _cleanliness,
        uint8 _size,
        uint8 _difficulty,
        uint8 _overall,
        string calldata _reviewText
    ) public payable {
        Gym storage gym = gyms[_gymId];
        require(gym.id != 0, "Gym does not exist");
        require(!gym.removed, "Gym has been removed");
        require(
            _cleanliness >= 1 && _cleanliness <= 5,
            "Cleanliness rating must be 1-5"
        );
        require(_size >= 1 && _size <= 5, "Size rating must be 1-5");
        require(
            _difficulty >= 1 && _difficulty <= 5,
            "Difficulty rating must be 1-5"
        );
        require(_overall >= 1 && _overall <= 5, "Overall rating must be 1-5");
        require(bytes(_reviewText).length > 0, "Review text cannot be empty");

        gymReviews[_gymId].push(
            Review({
                reviewer: msg.sender,
                cleanliness: _cleanliness,
                size: _size,
                difficulty: _difficulty,
                overall: _overall,
                reviewText: _reviewText,
                timestamp: block.timestamp
            })
        );

        gym.reviewCount++;
        gym.totalOverallRating += _overall;
        gym.meanOverallScore = gym.totalOverallRating / gym.reviewCount;

        emit ReviewSubmitted(
            _gymId,
            msg.sender,
            _cleanliness,
            _size,
            _difficulty,
            _overall,
            _reviewText
        );
    }

    function getAllGyms()
        public
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory locations,
            uint256[] memory meanOverallScores
        )
    {
        uint256 count = 0;
        for (uint256 i = 1; i <= gymIdCounter; i++) {
            if (!gyms[i].removed) count++;
        }

        ids = new uint256[](count);
        names = new string[](count);
        locations = new string[](count);
        meanOverallScores = new uint256[](count);

        uint256 index = 0;
        for (uint256 i = 1; i <= gymIdCounter; i++) {
            if (!gyms[i].removed) {
                Gym storage gym = gyms[i];
                ids[index] = gym.id;
                names[index] = gym.name;
                locations[index] = gym.location;
                meanOverallScores[index] = gym.meanOverallScore;
                index++;
            }
        }
    }

    function getReviews(uint256 _gymId) public view returns (Review[] memory) {
        Gym storage gym = gyms[_gymId];
        require(gym.id != 0, "Gym does not exist");
        require(!gym.removed, "Gym has been removed");
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

    // Utility function: hash data input
    function getHash(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(data));
    }
}
