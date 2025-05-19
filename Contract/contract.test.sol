// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// Import Foundry testing framework components
import {Test, console} from "forge-std/Test.sol";
// Import the tested contract from the provided file location and name
import {BoulderingGymReview} from "../src/test_20849751_1747620969.sol";

contract ContractTest is Test {
    BoulderingGymReview public gymReview;
    address public owner;
    address public user1;
    address public user2;

    // setUp() is called before every test
    function setUp() public {
        // Use the current msg.sender as the owner when deploying
        gymReview = new BoulderingGymReview();
        owner = address(this);
        // Initialize test accounts
        user1 = vm.addr(1);
        user2 = vm.addr(2);
        console.log("Owner is:", owner);
    }

    // ---------------------------
    // Test case for Gym addition
    // ---------------------------
    // Test a valid gym addition using proper gym name and location.
    function testAddGymValid() public {
        console.log("Running testAddGymValid");
        string memory name = "Climb High";
        string memory location = "Downtown";

        // Call addGym as msg.sender = owner by default.
        gymReview.addGym(name, location);

        // Retrieve gym info from public mapping (struct has 8 components).
        (uint256 gymId, , , , , , , ) = gymReview.gyms(1);
        assertEq(gymId, 1, "Gym ID should be 1 after first addition");
    }

    // Test adding a gym with an empty name, should revert.
    function testAddGymEmptyName() public {
        console.log("Running testAddGymEmptyName");
        string memory name = "";
        string memory location = "Downtown";
        vm.expectRevert("Gym name cannot be empty");
        gymReview.addGym(name, location);
    }

    // Test adding a gym with an empty location, should revert.
    function testAddGymEmptyLocation() public {
        console.log("Running testAddGymEmptyLocation");
        string memory name = "Climb High";
        string memory location = "";
        vm.expectRevert("Gym location cannot be empty");
        gymReview.addGym(name, location);
    }

    // Test adding a duplicate gym, which should revert.
    function testAddGymDuplicate() public {
        console.log("Running testAddGymDuplicate");
        string memory name = "Gym Duplicate";
        string memory location = "Uptown";
        gymReview.addGym(name, location);

        // Attempt to add a duplicate gym. The original function scans through existing gyms.
        vm.expectRevert("Gym with this name and location already exists");
        gymReview.addGym(name, location);
    }

    // ---------------------------
    // Test case for Gym removal
    // ---------------------------
    // Test removing a gym by the same caller who added it.
    function testRemoveGymByAddedBy() public {
        console.log("Running testRemoveGymByAddedBy");
        string memory name = "Solo Remove";
        string memory location = "East Side";
        gymReview.addGym(name, location);

        // Remove the gym by the same caller (owner, who added the gym)
        gymReview.removeGym(1);

        // Confirm gym is marked as removed.
        (, , , , , , , bool removed) = gymReview.gyms(1);
        assertTrue(removed, "Gym should be marked as removed");
    }

    // Test removing a gym by the contract owner if not the one who added it.
    function testRemoveGymByOwner() public {
        console.log("Running testRemoveGymByOwner");
        // Prank as user1 to add the gym.
        vm.prank(user1);
        gymReview.addGym("Community Gym", "West End");

        // Remove gym as owner (this contract's address).
        gymReview.removeGym(1);

        (, , , , , , , bool removed) = gymReview.gyms(1);
        assertTrue(
            removed,
            "Gym should be marked as removed after owner's removal"
        );
    }

    // Test unauthorized removal: neither gym adder nor owner.
    function testRemoveGymUnauthorized() public {
        console.log("Running testRemoveGymUnauthorized");
        // Prank as user1 to add the gym.
        vm.prank(user1);
        gymReview.addGym("Unauthorized Test", "Midtown");

        // Attempt to remove gym as user2, which should revert.
        vm.prank(user2);
        vm.expectRevert("Not authorized to remove this gym");
        gymReview.removeGym(1);
    }

    // Test removal of a non-existent gym.
    function testRemoveNonExistentGym() public {
        console.log("Running testRemoveNonExistentGym");
        vm.expectRevert("Gym does not exist");
        gymReview.removeGym(99);
    }

    // ---------------------------
    // Test cases for submitting reviews
    // ---------------------------
    // Test submitting a valid review.
    function testSubmitReviewValid() public {
        console.log("Running testSubmitReviewValid");
        // First add a gym.
        gymReview.addGym("Review Gym", "Central Park");

        // Submit a valid review. Ratings are within 1-5 and review text is non-empty.
        gymReview.submitReview(1, 5, 4, 3, 4, "Great experience!");

        // Fetch gym details to check updated review count and average overall score.
        (
            ,
            ,
            ,
            ,
            uint256 reviewCount,
            uint256 totalOverallRating,
            uint256 meanOverallScore,

        ) = gymReview.gyms(1);
        assertEq(reviewCount, 1, "Review count should be 1");
        assertEq(totalOverallRating, 4, "Total overall rating should be 4");
        assertEq(meanOverallScore, 4, "Mean overall score should be 4");
    }

    // Test submitting a review with an invalid rating.
    function testSubmitReviewInvalidRating() public {
        console.log("Running testSubmitReviewInvalidRating");
        gymReview.addGym("Invalid Rating Gym", "North End");

        // Cleanliness rating is 0 (invalid)
        vm.expectRevert("Cleanliness rating must be 1-5");
        gymReview.submitReview(1, 0, 4, 3, 4, "Bad cleanliness rating");

        // Size rating is 6 (invalid)
        vm.expectRevert("Size rating must be 1-5");
        gymReview.submitReview(1, 5, 6, 3, 4, "Bad size rating");

        // Difficulty rating is 0 (invalid)
        vm.expectRevert("Difficulty rating must be 1-5");
        gymReview.submitReview(1, 5, 4, 0, 4, "Bad difficulty rating");

        // Overall rating is 6 (invalid)
        vm.expectRevert("Overall rating must be 1-5");
        gymReview.submitReview(1, 5, 4, 3, 6, "Bad overall rating");

        // Empty review text
        vm.expectRevert("Review text cannot be empty");
        gymReview.submitReview(1, 5, 4, 3, 4, "");
    }

    // Test that submitting a review to a removed gym reverts.
    function testSubmitReviewToRemovedGym() public {
        console.log("Running testSubmitReviewToRemovedGym");
        gymReview.addGym("Removed Gym", "South Side");

        // Remove the gym
        gymReview.removeGym(1);

        // Try to submit a review - should revert because gym is removed.
        vm.expectRevert("Gym has been removed");
        gymReview.submitReview(1, 5, 4, 3, 4, "Review for removed gym");
    }

    // ---------------------------
    // Test cases for retrieval functions
    // ---------------------------
    // Test getAllGyms function returns only active (non-removed) gyms.
    function testGetAllGyms() public {
        console.log("Running testGetAllGyms");
        // Add several gyms.
        gymReview.addGym("Gym One", "Location One");
        gymReview.addGym("Gym Two", "Location Two");
        gymReview.addGym("Gym Three", "Location Three");

        // Remove one gym
        gymReview.removeGym(2);

        // Retrieve all gyms
        (
            uint256[] memory ids,
            string[] memory names,
            string[] memory locations,
            uint256[] memory meanOverallScores
        ) = gymReview.getAllGyms();
        // Expect 2 gyms remaining.
        assertEq(ids.length, 2, "There should be two active gyms");
        // Verify gym ids are for gyms 1 and 3.
        assertEq(ids[0], 1, "First active gym should be Gym 1");
        assertEq(ids[1], 3, "Second active gym should be Gym 3");
    }

    // Test getReviews for a gym.
    function testGetReviews() public {
        console.log("Running testGetReviews");
        gymReview.addGym("Review List Gym", "Downtown");

        // Submit two reviews.
        gymReview.submitReview(1, 4, 4, 4, 4, "Good gym");
        gymReview.submitReview(1, 5, 5, 5, 5, "Excellent gym");

        // Retrieve reviews.
        BoulderingGymReview.Review[] memory reviews = gymReview.getReviews(1);
        assertEq(reviews.length, 2, "There should be 2 reviews");

        // Check first review details.
        BoulderingGymReview.Review memory firstReview = reviews[0];
        assertEq(
            firstReview.overall,
            4,
            "First review overall rating should be 4"
        );
        // Check second review details.
        BoulderingGymReview.Review memory secondReview = reviews[1];
        assertEq(
            secondReview.overall,
            5,
            "Second review overall rating should be 5"
        );

        // Now remove the gym and ensure getReviews reverts.
        gymReview.removeGym(1);
        vm.expectRevert("Gym has been removed");
        gymReview.getReviews(1);
    }

    // ---------------------------
    // Test cases for utility functions
    // ---------------------------
    // Test getContractInfo returns plausible blockchain info.
    function testGetContractInfo() public {
        console.log("Running testGetContractInfo");
        (
            uint256 currentBlock,
            uint256 timestamp,
            address coinbase,
            uint256 gasLimit
        ) = gymReview.getContractInfo();
        // We know current block should be at least greater than zero.
        assertTrue(currentBlock > 0, "Block number should be > 0");
        // Timestamp should be non-zero.
        assertTrue(timestamp > 0, "Timestamp should be > 0");
        // gasLimit should be non-zero.
        assertTrue(gasLimit > 0, "Gas limit should be > 0");
        // coinbase could be any address, so no strict check.
    }

    // Test getHash utility function.
    function testGetHash() public {
        console.log("Running testGetHash");
        string memory data = "TestString";
        bytes32 hashValue = gymReview.getHash(data);
        bytes32 expectedHash = keccak256(abi.encodePacked(data));
        assertEq(
            uint256(hashValue),
            uint256(expectedHash),
            "Hash output should match expected value"
        );
    }

    // ---------------------------
    // Test potential common vulnerabilities
    // ---------------------------
    // Test that owner cannot be changed arbitrarily by external accounts.
    // In this contract, owner is set during construction and is never updated.
    // We simulate such a scenario by calling functions from a different account and ensuring owner remains unchanged.
    function testOwnerImmutability() public {
        console.log("Running testOwnerImmutability");
        // Prank as user1 and call an allowed function (e.g., addGym)
        vm.prank(user1);
        gymReview.addGym("Immutable Gym", "No Change");

        // The owner should still be the original deployer (this contract).
        address contractOwner = gymReview.owner();
        // In the absence of vulnerability, owner should not equal user1.
        assertTrue(
            contractOwner != user1,
            "Owner was updated by arbitrary caller"
        );
    }

    // Receive function is required to accept ether if needed
    receive() external payable {}
    fallback() external payable {}
}
