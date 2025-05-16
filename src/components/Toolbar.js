// src/components/Toolbar.js
import React from "react";

function Toolbar({ contract, loadingGyms, loadGyms, onAddGymClick, account }) {
  return (
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
          onClick={onAddGymClick}
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
  );
}

export default Toolbar;
