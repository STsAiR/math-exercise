// src/components/ReviewList.js
import React from "react";

function ReviewList({ reviews }) {
  return (
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
                  {r.reviewer.slice(0, 6) + "..." + r.reviewer.slice(-4)}
                </span>
              </div>
              <div>
                <b>Review:</b> {r.reviewText}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                <i>{r.timestamp}</i>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReviewList;
