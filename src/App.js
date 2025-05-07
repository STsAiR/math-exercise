import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";

// Replace with your deployed contract address
const contractAddress = "0xadc744e5d623e100d9461811c5b503c752fa75d3";

// Minimal ABI with used functions and structs
const contractABI = [
  "function getGymCount() view returns (uint256)",
  "function getAllGyms() view returns (uint256[] memory, string[] memory, string[] memory)",
  "function addGym(string calldata _name, string calldata _location) payable",
  "function submitReview(uint256 _gymId, uint8 _rating, string calldata _reviewText) payable",
  "function getReviews(uint256 _gymId) view returns (tuple(address reviewer, uint8 rating, string reviewText, uint256 timestamp)[])",
];

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);

  const [gyms, setGyms] = useState([]);
  const [newGymName, setNewGymName] = useState("");
  const [newGymLocation, setNewGymLocation] = useState("");

  const [selectedGymId, setSelectedGymId] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");

  // Initialize ethers provider, signer, contract and connect wallet
  useEffect(() => {
    if (!window.ethereum) {
      alert("MetaMask is required to use this app.");
      return;
    }

    async function init() {
      try {
        const prov = new BrowserProvider(window.ethereum);
        setProvider(prov);

        // Request wallet connection
        await prov.send("eth_requestAccounts", []);
        const signer = await prov.getSigner();
        setSigner(signer);

        const contract = new Contract(contractAddress, contractABI, signer);
        setContract(contract);

        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
    init();
  }, []);

  // Load all gyms from contract
  async function loadGyms() {
    if (!contract) return;
    try {
      const [ids, names, locations] = await contract.getAllGyms();
      const gymsList = ids.map((id, idx) => ({
        id: id.toString(),
        name: names[idx],
        location: locations[idx],
      }));
      setGyms(gymsList);
    } catch (error) {
      console.error("Failed to load gyms:", error);
      alert("Failed to load gyms. Check console.");
    }
  }

  // Load reviews for selected gym
  async function loadReviews(gymId) {
    if (!contract || !gymId) return;
    try {
      const rawReviews = await contract.getReviews(gymId);
      const cleanedReviews = rawReviews.map((r) => ({
        reviewer: r.reviewer,
        rating: r.rating,
        reviewText: r.reviewText,
        timestamp: new Date(r.timestamp.toNumber() * 1000).toLocaleString(),
      }));
      setReviews(cleanedReviews);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      alert("Failed to load reviews. Check console.");
    }
  }

  // Handle adding a new gym
  async function handleAddGym() {
    if (!contract || !newGymName || !newGymLocation) return;
    try {
      const tx = await contract.addGym(newGymName, newGymLocation, {
        value: 0,
      });
      await tx.wait();
      alert("Gym added successfully!");
      setNewGymName("");
      setNewGymLocation("");
      loadGyms();
    } catch (error) {
      console.error("Failed to add gym:", error);
      alert("Failed to add gym: " + error.message);
    }
  }

  // Handle submitting a review
  async function handleSubmitReview() {
    if (!contract || !selectedGymId || !newReviewText) return;
    try {
      const tx = await contract.submitReview(
        selectedGymId,
        newReviewRating,
        newReviewText,
        { value: 0 }
      );
      await tx.wait();
      alert("Review submitted!");
      setNewReviewText("");
      setNewReviewRating(5);
      loadReviews(selectedGymId);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review: " + error.message);
    }
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Bouldering Gym Review</h1>
      <p>
        <b>Connected Wallet:</b> {account || "Not connected"}
      </p>

      <button
        onClick={loadGyms}
        disabled={!contract}
        style={{ marginBottom: 20 }}
      >
        Load Gyms
      </button>

      <section style={{ marginBottom: 40 }}>
        <h2>Add New Gym</h2>
        <input
          type="text"
          placeholder="Gym Name"
          value={newGymName}
          onChange={(e) => setNewGymName(e.target.value)}
          style={{ marginRight: 10, padding: 5 }}
        />
        <input
          type="text"
          placeholder="Gym Location"
          value={newGymLocation}
          onChange={(e) => setNewGymLocation(e.target.value)}
          style={{ marginRight: 10, padding: 5 }}
        />
        <button
          onClick={handleAddGym}
          disabled={!newGymName || !newGymLocation}
        >
          Add Gym
        </button>
      </section>

      <section>
        <h2>Gyms</h2>
        {gyms.length === 0 ? (
          <p>No gyms loaded yet.</p>
        ) : (
          <ul>
            {gyms.map((gym) => (
              <li key={gym.id} style={{ marginBottom: 10 }}>
                <b>{gym.name}</b> — {gym.location}{" "}
                <button
                  onClick={() => {
                    setSelectedGymId(gym.id);
                    loadReviews(gym.id);
                  }}
                >
                  View Reviews
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedGymId && (
        <section style={{ marginTop: 40 }}>
          <h3>Reviews for Gym ID {selectedGymId}</h3>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <ul>
              {reviews.map((r, i) => (
                <li key={i} style={{ marginBottom: 15 }}>
                  <b>Rating:</b> {r.rating} / 5<br />
                  <b>Reviewer:</b> {r.reviewer}
                  <br />
                  <b>Review:</b> {r.reviewText}
                  <br />
                  <small>
                    <i>{r.timestamp}</i>
                  </small>
                </li>
              ))}
            </ul>
          )}

          <h4>Submit Review</h4>
          <label>
            Rating:{" "}
            <select
              value={newReviewRating}
              onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
              style={{ marginBottom: 10 }}
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <br />
          <textarea
            rows={4}
            cols={50}
            placeholder="Write your review here"
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            style={{ display: "block", marginBottom: 10 }}
          />
          <button onClick={handleSubmitReview} disabled={!newReviewText}>
            Submit Review
          </button>
        </section>
      )}
    </div>
  );
}

export default App;
