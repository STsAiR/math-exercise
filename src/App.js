import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Dynamically import all PDF files inside ./exercises folder
function importAll(r) {
  return r.keys().map((key) => ({
    fileName: key.replace("./", ""),
    filePath: r(key).default || r(key),
  }));
}

const pdfFiles = importAll(require.context("./exercises", false, /\.pdf$/));

export default function App() {
  const [selectedFile, setSelectedFile] = useState(
    pdfFiles[0]?.filePath || null
  );

  const downloadAllAsZip = async () => {
    if (pdfFiles.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("exercises");

    try {
      await Promise.all(
        pdfFiles.map(async ({ fileName, filePath }) => {
          const response = await fetch(filePath);
          if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);
          const blob = await response.blob();
          folder.file(fileName, blob);
        })
      );

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "exercises.zip");
    } catch (error) {
      alert("Error creating ZIP: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h1>Math Exercise Page</h1>

      <div style={{ marginBottom: 20 }}>
        <h2>Available PDFs</h2>
        <button
          onClick={downloadAllAsZip}
          disabled={pdfFiles.length === 0}
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            cursor: pdfFiles.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Download All as ZIP
        </button>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {pdfFiles.map(({ fileName, filePath }) => (
            <li key={fileName} style={{ marginBottom: 8 }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "1rem",
                }}
                onClick={() => setSelectedFile(filePath)}
              >
                {fileName}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ border: "1px solid #ccc", height: "600px" }}>
        {selectedFile ? (
          <iframe
            title="PDF Viewer"
            src={selectedFile}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <p>No PDF selected</p>
        )}
      </div>
    </div>
  );
}
