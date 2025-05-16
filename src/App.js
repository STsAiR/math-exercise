import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import Modal from "./components/Modal";
import Toolbar from "./components/Toolbar";
import GymCard from "./components/GymCard";
import background from "./background.jpeg";

// const contractAddress = "0xadc744e5d623e100d9461811c5b503c752fa75d3";
// const contractAddress = "0xf2fe4f48920828d2822b2d6ef6eec91af2632b17";
const contractAddress = "0x3ef39b4231a645ba947bb2a02d428c377259ef78";

const contractABI = [
  "function getGymCount() view returns (uint256)",
  "function getAllGyms() view returns (uint256[] memory, string[] memory, string[] memory, uint256[] memory)",
  "function addGym(string calldata _name, string calldata _location) payable",
  "function submitReview(uint256 _gymId, uint8 _rating, string calldata _reviewText) payable",
  "function getReviews(uint256 _gymId) view returns (tuple(address reviewer, uint8 rating, string reviewText, uint256 timestamp)[])",
  "function removeGym(uint256 _gymId) public",
];

function App() {
  const appStyle = {
    fontFamily: "Arial, sans-serif",
    maxWidth: 900,
    margin: "auto",
    padding: 20,
    backgroundColor: "#f9f9f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    // backgroundRepeat: "no-repeat",
  };

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(false);

  // Modal states
  const [showAddGymModal, setShowAddGymModal] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);

  // Add Gym form
  const [newGymName, setNewGymName] = useState("");
  const [newGymLocation, setNewGymLocation] = useState("");

  // Review form
  const [selectedGymForReview, setSelectedGymForReview] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");

  // Expanded cards for showing reviews
  const [expandedGymIds, setExpandedGymIds] = useState(new Set());
  const [reviewsByGymId, setReviewsByGymId] = useState({});

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

  async function loadGyms() {
    if (!contract) return;
    try {
      setLoadingGyms(true);
      // Updated to receive meanScores as the 4th returned value
      const [ids, names, locations, meanScores] = await contract.getAllGyms();

      const gymsList = ids.map((id, idx) => ({
        id: Number(id),
        name: names[idx],
        location: locations[idx],
        meanScore: Number(meanScores[idx]), // add meanScore here
      }));

      setGyms(gymsList);
      setExpandedGymIds(new Set());
      setReviewsByGymId({});
    } catch (error) {
      console.error("Failed to load gyms:", error);
      alert("Failed to load gyms. Check console.");
    } finally {
      setLoadingGyms(false);
    }
  }

  async function loadReviews(gymId) {
    if (!contract || !gymId) return;
    try {
      const rawReviews = await contract.getReviews(gymId);
      const cleanedReviews = rawReviews.map((r) => ({
        reviewer: r.reviewer,
        rating: r.rating,
        reviewText: r.reviewText,
        timestamp: new Date(Number(r.timestamp) * 1000).toLocaleString(),
      }));
      setReviewsByGymId((prev) => ({ ...prev, [gymId]: cleanedReviews }));
    } catch (error) {
      console.error("Failed to load reviews:", error);
      alert("Failed to load reviews. Check console.");
    }
  }

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
      setShowAddGymModal(false);
      loadGyms();
    } catch (error) {
      console.error("Failed to add gym:", error);
      alert("Failed to add gym: " + error.message);
    }
  }

  async function handleSubmitReview() {
    if (!contract || !selectedGymForReview || !newReviewText) return;
    try {
      const tx = await contract.submitReview(
        selectedGymForReview,
        newReviewRating,
        newReviewText,
        { value: 0 }
      );
      await tx.wait();
      alert("Review submitted!");
      setNewReviewText("");
      setNewReviewRating(5);
      setShowAddReviewModal(false);
      await loadGyms();
      await loadReviews(selectedGymForReview);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Failed to submit review: " + error.message);
    }
  }

  function toggleExpandGym(gymId) {
    const newSet = new Set(expandedGymIds);
    if (newSet.has(gymId)) {
      newSet.delete(gymId);
    } else {
      newSet.add(gymId);
      // Load reviews when expanding
      loadReviews(gymId);
    }
    setExpandedGymIds(newSet);
  }

  async function handleRemoveGym(gymId) {
    if (!contract) return;

    const gym = gyms.find((g) => g.id === gymId);
    if (!gym) {
      alert("Gym not found");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove the gym "${gym.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const tx = await contract.removeGym(gymId);
      await tx.wait();
      alert(`Gym "${gym.name}" removed successfully.`);
      loadGyms();
    } catch (error) {
      console.error("Failed to remove gym:", error);
      alert("Failed to remove gym: " + error.message);
    }
  }

  function handleAddReviewClick(gymId) {
    setSelectedGymForReview(gymId);
    setShowAddReviewModal(true);
    setNewReviewRating(5);
    setNewReviewText("");
  }

  return (
    <div style={appStyle}>
      <Toolbar
        contract={contract}
        loadingGyms={loadingGyms}
        loadGyms={loadGyms}
        onAddGymClick={() => setShowAddGymModal(true)}
        account={account}
      />

      {/* Gyms List */}
      <main style={{ flexGrow: 1 }}>
        {gyms.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            No gyms loaded yet. Click "Load Gyms" to fetch.
          </p>
        ) : (
          gyms.map((gym) => (
            <GymCard
              key={gym.id}
              gym={gym}
              isExpanded={expandedGymIds.has(gym.id)}
              toggleExpandGym={toggleExpandGym}
              reviews={reviewsByGymId[gym.id] || []}
              onAddReviewClick={handleAddReviewClick}
              onRemoveGym={handleRemoveGym}
              meanScore={gym.meanScore} // pass meanScore prop
            />
          ))
        )}
      </main>
      {/* Add Gym Modal */}
      {showAddGymModal && (
        <Modal onClose={() => setShowAddGymModal(false)} title="Add New Gym">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="text"
              placeholder="Gym Name"
              value={newGymName}
              onChange={(e) => setNewGymName(e.target.value)}
              style={{ padding: 8, fontSize: 16 }}
            />
            <input
              type="text"
              placeholder="Gym Location"
              value={newGymLocation}
              onChange={(e) => setNewGymLocation(e.target.value)}
              style={{ padding: 8, fontSize: 16 }}
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => setShowAddGymModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGym}
                disabled={!newGymName || !newGymLocation}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor:
                    newGymName && newGymLocation ? "#28a745" : "#a0dca0",
                  color: "white",
                  cursor:
                    newGymName && newGymLocation ? "pointer" : "not-allowed",
                }}
              >
                Add Gym
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Review Modal */}
      {showAddReviewModal && selectedGymForReview !== null && (
        <Modal
          onClose={() => setShowAddReviewModal(false)}
          title={`Add Review for ${
            gyms.find((g) => g.id === selectedGymForReview)?.name || ""
          }`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: "bold" }}>
              Rating:
              <select
                value={newReviewRating}
                onChange={(e) => setNewReviewRating(parseInt(e.target.value))}
                style={{ marginLeft: 10, padding: 6, fontSize: 16 }}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              rows={4}
              placeholder="Write your review here"
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              style={{ padding: 8, fontSize: 16, resize: "vertical" }}
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => setShowAddReviewModal(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!newReviewText}
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor: newReviewText ? "#ffc107" : "#f0e68c",
                  color: "#333",
                  cursor: newReviewText ? "pointer" : "not-allowed",
                }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;
