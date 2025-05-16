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
        uint256 meanScore; // Mean score scaled by 1e18 for precision
        string[] photos; // Array of photos (IPFS hashes or URLs)
    }

    struct Review {
        address reviewer;
        uint8 rating; // 1-5 scale
        string reviewText;
        uint256 timestamp;
        string[] photos; // Optional multiple photos per review
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
        address indexed addedBy,
        string[] photos
    );
    event ReviewSubmitted(
        uint256 indexed gymId,
        address indexed reviewer,
        uint8 rating,
        string reviewText,
        string[] photos,
        uint256 newMeanScore
    );

    constructor() payable {
        owner = msg.sender;
    }

    // Add a new gym (with duplicate check) with mandatory photos
    function addGym(
        string calldata _name,
        string calldata _location,
        string[] calldata _photos
    ) public payable {
        require(bytes(_name).length > 0, "Gym name cannot be empty");
        require(bytes(_location).length > 0, "Gym location cannot be empty");
        require(_photos.length > 0, "At least one photo required");

        bytes32 gymKey = keccak256(abi.encodePacked(_name, _location));
        require(
            !gymExists[gymKey],
            "Gym with this name and location already exists"
        );

        gymIdCounter++;
        Gym storage newGym = gyms[gymIdCounter];
        newGym.id = gymIdCounter;
        newGym.name = _name;
        newGym.location = _location;
        newGym.addedBy = msg.sender;
        newGym.reviewCount = 0;
        newGym.meanScore = 0;

        // Copy photos, ensure no empty strings
        for (uint256 i = 0; i < _photos.length; i++) {
            require(
                bytes(_photos[i]).length > 0,
                "Photo string cannot be empty"
            );
            newGym.photos.push(_photos[i]);
        }

        gymExists[gymKey] = true;

        emit GymAdded(gymIdCounter, _name, _location, msg.sender, _photos);
    }

    // Submit a review for a gym with optional multiple photos
    function submitReview(
        uint256 _gymId,
        uint8 _rating,
        string calldata _reviewText,
        string[] calldata _photos
    ) public payable {
        require(_rating >= 1 && _rating <= 5, "Rating must be 1-5");
        require(bytes(_reviewText).length > 0, "Review text cannot be empty");
        require(gyms[_gymId].id != 0, "Gym does not exist");

        // Validate photos if any are provided
        for (uint256 i = 0; i < _photos.length; i++) {
            require(
                bytes(_photos[i]).length > 0,
                "Photo string cannot be empty"
            );
        }

        Review memory newReview = Review({
            reviewer: msg.sender,
            rating: _rating,
            reviewText: _reviewText,
            timestamp: block.timestamp,
            photos: new string[](_photos.length)
        });

        for (uint256 i = 0; i < _photos.length; i++) {
            newReview.photos[i] = _photos[i];
        }

        gymReviews[_gymId].push(newReview);

        Gym storage gym = gyms[_gymId];
        gym.reviewCount++;

        // Update mean score: meanScore is scaled by 1e18 for precision
        // meanScore = (oldMean * oldCount + newRating) / newCount
        uint256 oldTotal = gym.meanScore * (gym.reviewCount - 1);
        uint256 newMeanScaled = (oldTotal + uint256(_rating) * 1e18) /
            gym.reviewCount;
        gym.meanScore = newMeanScaled;

        emit ReviewSubmitted(
            _gymId,
            msg.sender,
            _rating,
            _reviewText,
            _photos,
            newMeanScaled
        );
    }

    // Get total gyms count
    function getGymCount() public view returns (uint256) {
        return gymIdCounter;
    }

    // Get all gyms info: returns arrays of ids, names, locations, photos, and meanScores (scaled by 1e18)
    function getAllGyms()
        public
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory locations,
            string[][] memory photos,
            uint256[] memory meanScores
        )
    {
        ids = new uint256[](gymIdCounter);
        names = new string[](gymIdCounter);
        locations = new string[](gymIdCounter);
        photos = new string[][](gymIdCounter);
        meanScores = new uint256[](gymIdCounter);

        for (uint256 i = 0; i < gymIdCounter; i++) {
            uint256 gymId = i + 1;
            Gym storage gym = gyms[gymId];
            ids[i] = gymId;
            names[i] = gym.name;
            locations[i] = gym.location;
            photos[i] = gym.photos;
            meanScores[i] = gym.meanScore;
        }
    }

    // Get reviews for a gym, including photos
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

// contract address: 0x9807fc7f3659593e6813fb9af6f4f2d876fa9901
