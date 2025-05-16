import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";

const contractAddress = "0x9807fc7f3659593e6813fb9af6f4f2d876fa9901";
const contractABI = [
  "function getGymCount() view returns (uint256)",
  "function getAllGyms() view returns (uint256[] memory, string[] memory, string[] memory, string[][] memory, uint256[] memory)",
  "function addGym(string calldata _name, string calldata _location, string[] calldata _photos) payable",
  "function submitReview(uint256 _gymId, uint8 _rating, string calldata _reviewText, string[] calldata _photos) payable",
  "function getReviews(uint256 _gymId) view returns (tuple(address reviewer, uint8 rating, string reviewText, uint256 timestamp, string[] photos)[])",
];

function App() {
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
  const [newGymPhotosText, setNewGymPhotosText] = useState(""); // comma separated photos input

  // Review form
  const [selectedGymForReview, setSelectedGymForReview] = useState(null);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewPhotosText, setNewReviewPhotosText] = useState(""); // comma separated photos input (optional)

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
      const [ids, names, locations, photosArr, meanScores] =
        await contract.getAllGyms();
      const gymsList = ids.map((id, idx) => ({
        id: Number(id),
        name: names[idx],
        location: locations[idx],
        photos: photosArr[idx],
        meanScore: Number(meanScores[idx]) / 1e18, // scale down
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
        photos: r.photos,
      }));
      setReviewsByGymId((prev) => ({ ...prev, [gymId]: cleanedReviews }));
    } catch (error) {
      console.error("Failed to load reviews:", error);
      alert("Failed to load reviews. Check console.");
    }
  }

  async function handleAddGym() {
    if (!contract || !newGymName || !newGymLocation) {
      alert("Please fill in gym name, location and at least one photo.");
      return;
    }

    // Parse photos input (comma separated, trim spaces)
    const photos = newGymPhotosText
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (photos.length === 0) {
      alert("Please provide at least one photo URL for the gym.");
      return;
    }

    try {
      const tx = await contract.addGym(newGymName, newGymLocation, photos, {
        value: 0,
      });
      await tx.wait();
      alert("Gym added successfully!");
      setNewGymName("");
      setNewGymLocation("");
      setNewGymPhotosText("");
      setShowAddGymModal(false);
      loadGyms();
    } catch (error) {
      console.error("Failed to add gym:", error);
      alert("Failed to add gym: " + (error.data?.message || error.message));
    }
  }

  async function handleSubmitReview() {
    if (!contract || !selectedGymForReview || !newReviewText) {
      alert("Please fill in review text.");
      return;
    }

    // Parse photos input (optional)
    const photos = newReviewPhotosText
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      const tx = await contract.submitReview(
        selectedGymForReview,
        newReviewRating,
        newReviewText,
        photos,
        { value: 0 }
      );
      await tx.wait();
      alert("Review submitted!");
      setNewReviewText("");
      setNewReviewPhotosText("");
      setNewReviewRating(5);
      setShowAddReviewModal(false);
      loadReviews(selectedGymForReview);
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(
        "Failed to submit review: " + (error.data?.message || error.message)
      );
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

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: 900,
        margin: "auto",
        padding: 20,
        backgroundColor: "#f9f9f9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#004d99",
          color: "white",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={loadGyms}
            disabled={!contract || loadingGyms}
            style={{
              backgroundColor: "#007bff",
              border: "none",
              color: "white",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: contract && !loadingGyms ? "pointer" : "not-allowed",
              fontWeight: "bold",
            }}
          >
            {loadingGyms ? "Loading..." : "Load Gyms"}
          </button>
          <button
            onClick={() => setShowAddGymModal(true)}
            style={{
              backgroundColor: "#28a745",
              border: "none",
              color: "white",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Add Gym
          </button>
        </div>
        <div style={{ fontWeight: "bold", fontSize: 14 }}>
          Connected Wallet:{" "}
          <span
            style={{
              fontFamily: "monospace",
              backgroundColor: "#003366",
              padding: "4px 8px",
              borderRadius: 4,
            }}
            title={account}
          >
            {account
              ? account.slice(0, 6) + "..." + account.slice(-4)
              : "Not connected"}
          </span>
        </div>
      </header>

      {/* Gyms List */}
      <main style={{ flexGrow: 1 }}>
        {gyms.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            No gyms loaded yet. Click "Load Gyms" to fetch.
          </p>
        ) : (
          gyms.map((gym) => {
            const isExpanded = expandedGymIds.has(gym.id);
            const reviews = reviewsByGymId[gym.id] || [];
            return (
              <div
                key={gym.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 20,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                  transition: "box-shadow 0.3s ease",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 4 }}>{gym.name}</h3>
                <p style={{ marginTop: 0, marginBottom: 4, color: "#555" }}>
                  Location: {gym.location}
                </p>
                <p
                  style={{
                    marginTop: 0,
                    marginBottom: 10,
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  Mean Rating: {gym.meanScore.toFixed(2)} / 5
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  {gym.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Gym photo ${idx + 1}`}
                      style={{
                        maxWidth: 120,
                        maxHeight: 90,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }} // hide broken images
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => toggleExpandGym(gym.id)}
                    style={{
                      backgroundColor: "#17a2b8",
                      border: "none",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {isExpanded ? "Hide Reviews" : "View Reviews"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGymForReview(gym.id);
                      setShowAddReviewModal(true);
                      setNewReviewRating(5);
                      setNewReviewText("");
                      setNewReviewPhotosText("");
                    }}
                    style={{
                      backgroundColor: "#ffc107",
                      border: "none",
                      color: "#333",
                      padding: "6px 12px",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Add Review
                  </button>
                </div>

                {/* Expanded Reviews Section */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: 20,
                      borderTop: "1px solid #ddd",
                      paddingTop: 15,
                    }}
                  >
                    <h4>Reviews</h4>
                    {reviews.length === 0 ? (
                      <p style={{ color: "#777" }}>No reviews yet.</p>
                    ) : (
                      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                        {reviews.map((r, i) => (
                          <li
                            key={i}
                            style={{
                              marginBottom: 15,
                              backgroundColor: "#f8f9fa",
                              padding: 10,
                              borderRadius: 6,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                          >
                            <div>
                              <b>Rating:</b> {r.rating} / 5
                            </div>
                            <div>
                              <b>Reviewer:</b>{" "}
                              <span
                                style={{
                                  fontFamily: "monospace",
                                }}
                                title={r.reviewer}
                              >
                                {r.reviewer.slice(0, 6) +
                                  "..." +
                                  r.reviewer.slice(-4)}
                              </span>
                            </div>
                            <div>
                              <b>Review:</b> {r.reviewText}
                            </div>
                            {r.photos.length > 0 && (
                              <div
                                style={{
                                  marginTop: 6,
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                {r.photos.map((photo, idx) => (
                                  <img
                                    key={idx}
                                    src={photo}
                                    alt={`Review photo ${idx + 1}`}
                                    style={{
                                      maxWidth: 100,
                                      maxHeight: 80,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: 12,
                                color: "#666",
                                marginTop: 5,
                              }}
                            >
                              <i>{r.timestamp}</i>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })
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
            <textarea
              placeholder="Gym photos URLs (comma separated, at least one)"
              value={newGymPhotosText}
              onChange={(e) => setNewGymPhotosText(e.target.value)}
              style={{ padding: 8, fontSize: 16, resize: "vertical" }}
              rows={3}
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
                disabled={
                  !newGymName ||
                  !newGymLocation ||
                  newGymPhotosText.trim() === ""
                }
                style={{
                  padding: "8px 16px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor:
                    newGymName &&
                    newGymLocation &&
                    newGymPhotosText.trim() !== ""
                      ? "#28a745"
                      : "#a0dca0",
                  color: "white",
                  cursor:
                    newGymName &&
                    newGymLocation &&
                    newGymPhotosText.trim() !== ""
                      ? "pointer"
                      : "not-allowed",
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
            <textarea
              placeholder="Review photos URLs (comma separated, optional)"
              value={newReviewPhotosText}
              onChange={(e) => setNewReviewPhotosText(e.target.value)}
              style={{ padding: 8, fontSize: 16, resize: "vertical" }}
              rows={2}
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

function Modal({ onClose, title, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 8,
          minWidth: 320,
          maxWidth: "90vw",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default App;
