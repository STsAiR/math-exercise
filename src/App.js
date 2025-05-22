import React, { useState } from "react";

function importAll(r) {
  return r.keys().map((key) => ({
    fileName: key.replace("./", ""),
    filePath: r(key),
  }));
}

const pdfFiles = importAll(require.context("./exercises", false, /\.pdf$/));

export default function App() {
  const [selectedFile, setSelectedFile] = useState(
    pdfFiles[0]?.filePath || null
  );

  return (
    <div>
      <h1>Math Exercise Page</h1>
      <ul>
        {pdfFiles.map(({ fileName, filePath }) => (
          <li key={fileName}>
            <button onClick={() => setSelectedFile(filePath)}>
              {fileName}
            </button>
          </li>
        ))}
      </ul>

      {selectedFile && (
        <iframe
          src={selectedFile}
          style={{ width: "100%", height: "600px", border: "none" }}
          title="PDF Viewer"
        />
      )}
    </div>
  );
}
