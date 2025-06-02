import React, { useState, useEffect } from "react";
import { subjects, paperOptions } from "../constants";

export default function PaperOpener() {
  const currentYear = new Date().getFullYear() + 1;
  const [yearOptions, setYearOptions] = useState([]);
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [paperNumber, setPaperNumber] = useState("");
  const [showPaperNumberGroup, setShowPaperNumberGroup] = useState(true);

  useEffect(() => {
    const years = Array.from({ length: currentYear - 2013 }, (_, i) => {
      const y = (currentYear - 1 - i).toString();
      return { value: y, label: y };
    });
    setYearOptions(years);
    setYear(years[0]?.value || "");
    setSubject(Object.keys(subjects)[0] || "");
  }, [currentYear]);

  useEffect(() => {
    if (subject === "m1" || subject === "m2") {
      setShowPaperNumberGroup(false);
      setPaperNumber("");
    } else {
      setShowPaperNumberGroup(true);
      const options = paperOptions[subject] || paperOptions.default;
      setPaperNumber(options[0]);
    }
  }, [subject]);

  function generateUrl(type, year, subject, paper = "") {
    const baseUrl = process.env.PUBLIC_URL || ""; // 例如 '/math-exercise'，或空字串
    if (subject === "m1" || subject === "m2") {
      // 例如 public/m1/2012/pp.pdf
      return `${baseUrl}/${subject}/${year}/pp.pdf`;
    } else if (
      ["phy", "ict", "bafs", "chem", "bio", "econ", "enghist", "geog"].includes(
        subject
      )
    ) {
      const fileName = type === "ans" ? "ans" : paper;
      // 例如 public/phy/2012/ans.pdf 或 public/phy/2012/p1.pdf
      return `${baseUrl}/${subject}/${year}/${fileName}.pdf`;
    } else {
      const subjectPath = subject === "m0" ? "m0" : subject;
      const fileName = type === "ans" ? "ans" : paper;
      // 例如 public/m0/2012/p1.pdf
      return `${baseUrl}/${subjectPath}/${year}/${fileName}.pdf`;
    }
  }

  function openPaper() {
    if (!year || !subject) return;
    const paper = subject !== "m1" && subject !== "m2" ? paperNumber : "";
    const url = generateUrl("paper", year, subject, paper);
    window.open(url, "_blank");
  }

  return (
    <section id="paper-opener" className="section active">
      <h2>試卷開啟器</h2>
      <div className="input-group">
        <label htmlFor="paper-year">選擇年份</label>
        <select
          id="paper-year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {yearOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="paper-subject">選擇科目</label>
        <select
          id="paper-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {Object.entries(subjects).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {showPaperNumberGroup && (
        <div className="input-group" id="paper-number-group">
          <label htmlFor="paper-number">選擇試卷</label>
          <select
            id="paper-number"
            value={paperNumber}
            onChange={(e) => setPaperNumber(e.target.value)}
          >
            {(paperOptions[subject] || paperOptions.default).map((option) => (
              <option key={option} value={option}>
                試卷{option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      <button onClick={openPaper}>
        <i className="fas fa-external-link-alt"></i> 打開試卷
      </button>
    </section>
  );
}
