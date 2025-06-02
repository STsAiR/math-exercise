import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Nav from "./components/Nav";
import GradeCalculator from "./components/GradeCalculator";
import AnswerSearch from "./components/AnswerSearch";
import VideoSearch from "./components/VideoSearch";
import PaperOpener from "./components/PaperOpener";
import ExerciseOpener from "./components/ExerciseOpener";
import "./App.css";

function App() {
  const [activeSection, setActiveSection] = useState("grade-calculator");
  const [cutoffData, setCutoffData] = useState(null);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/cutoffData.json")
      .then((res) => res.json())
      .then((data) => setCutoffData(data))
      .catch((err) => console.error("Error loading cutoff data:", err));
  }, []);

  useEffect(() => {
    const examDate = new Date("2026-04-08T00:00:00").getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = examDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours: padZero(hours),
        minutes: padZero(minutes),
        seconds: padZero(seconds),
      });
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  function padZero(num) {
    return num < 10 ? "0" + num : num;
  }

  return (
    <div className="container">
      <Header countdown={countdown} />
      <Nav activeSection={activeSection} setActiveSection={setActiveSection} />
      {activeSection === "grade-calculator" && (
        <GradeCalculator cutoffData={cutoffData} />
      )}
      {activeSection === "answer-search" && <AnswerSearch />}
      {activeSection === "video-search" && <VideoSearch />}
      {activeSection === "paper-opener" && <PaperOpener />}
      {activeSection === "exercise-opener" && <ExerciseOpener />}
      {/* Add ExerciseExtract component here if needed */}
    </div>
  );
}

export default App;
