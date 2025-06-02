import React, { useState, useEffect } from "react";

export default function ExerciseOpener() {
  const [exerciseList, setExerciseList] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");

  useEffect(() => {
    // Fetch the manifest JSON file from public folder
    fetch(process.env.PUBLIC_URL + "/exerciseList.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load exercise list");
        }
        return res.json();
      })
      .then((list) => {
        setExerciseList(list);
        if (list.length > 0) setSelectedExercise(list[0]);
      })
      .catch((err) => {
        console.error(err);
        setExerciseList([]);
      });
  }, []);

  const openExercise = () => {
    if (!selectedExercise) return;
    const url = `${process.env.PUBLIC_URL}/exercises/${selectedExercise}`;
    window.open(url, "_blank");
  };

  return (
    <section id="exercise-opener" className="section active">
      <h2>練習題開啟器</h2>

      <div className="input-group">
        <label htmlFor="exercise-select">選擇練習題</label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {exerciseList.length > 0 ? (
            exerciseList.map((filename) => (
              <option key={filename} value={filename}>
                {filename}
              </option>
            ))
          ) : (
            <option disabled>無練習題檔案</option>
          )}
        </select>
      </div>

      <button onClick={openExercise} disabled={!selectedExercise}>
        打開練習題
      </button>
    </section>
  );
}
