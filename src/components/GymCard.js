// src/components/GymCard.js
import React from "react";
import ReviewList from "./ReviewList";

function GymCard({
  gym,
  isExpanded,
  toggleExpandGym,
  reviews,
  onAddReviewClick,
  onRemoveGym,
  meanScore,
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10 }}>{gym.name}</h3>
      <p style={{ marginTop: 0, marginBottom: 15, color: "#555" }}>
        Location: {gym.location}
      </p>
      <p style={{ fontWeight: "bold", color: "#333" }}>
        Average Rating: {meanScore} / 5
      </p>
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
          onClick={() => onAddReviewClick(gym.id)}
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
        {onRemoveGym && (
          <button
            onClick={() => onRemoveGym(gym.id)}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "none",
              backgroundColor: "#dc3545",
              color: "white",
              cursor: "pointer",
            }}
            title="Remove Gym"
          >
            Remove
          </button>
        )}
      </div>

      {isExpanded && <ReviewList reviews={reviews} />}
    </div>
  );
}

export default GymCard;
