import React, { useState, useEffect } from "react";
import { subjects, paperFullMarks } from "../constants";

export default function GradeCalculator({ cutoffData }) {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState("highest");
  const [subject, setSubject] = useState("chi");
  const [paper, setPaper] = useState("p1");
  const [fullMark, setFullMark] = useState(paperFullMarks.chi.p1);
  const [mark, setMark] = useState("");
  const [result, setResult] = useState("");
  const [showPaperGroup, setShowPaperGroup] = useState(true);

  // Year options for the select dropdown
  const yearOptions = [
    { value: "highest", label: "最高分數線" },
    ...Array.from({ length: currentYear - 2013 }, (_, i) => {
      const y = (currentYear - 1 - i).toString();
      return { value: y, label: y };
    }),
  ];

  // Update paper options and full mark when subject changes
  useEffect(() => {
    if (subject === "chi" || subject === "eng") {
      const papers =
        subject === "chi" ? ["p1", "p2"] : ["p1", "p2", "p3", "p4"];
      setPaper(papers[0]);
      setFullMark(paperFullMarks[subject][papers[0]]);
      setShowPaperGroup(true);
    } else {
      setPaper("");
      setFullMark(
        subject === "m1" || subject === "m2" ? paperFullMarks.default : ""
      );
      setShowPaperGroup(false);
    }
  }, [subject]);

  // Update fullMark when paper changes
  useEffect(() => {
    if ((subject === "chi" || subject === "eng") && paper) {
      setFullMark(paperFullMarks[subject][paper]);
    }
  }, [paper, subject]);

  // Calculate highest cutoff for a subject across all years
  function calculateHighestCutoff(subject) {
    if (!cutoffData || !cutoffData[subject]) return null;

    const highestCutoff = {};

    for (const yearKey in cutoffData[subject]) {
      const yearData = cutoffData[subject][yearKey];
      for (const paperKey in yearData) {
        if (!highestCutoff[paperKey]) highestCutoff[paperKey] = {};

        const gradeData = yearData[paperKey];
        for (const gradeKey in gradeData) {
          const val = gradeData[gradeKey];
          if (val === null) continue; // skip null values
          if (
            highestCutoff[paperKey][gradeKey] === undefined ||
            val > highestCutoff[paperKey][gradeKey]
          ) {
            highestCutoff[paperKey][gradeKey] = val;
          }
        }
      }
    }
    return highestCutoff;
  }

  // Calculate grade based on input
  function calculateGrade() {
    if (!cutoffData) {
      setResult("分數線資料載入中，請稍候...");
      return;
    }

    const markNum = parseFloat(mark);
    const fullMarkNum = parseFloat(fullMark);

    if (isNaN(markNum) || isNaN(fullMarkNum)) {
      setResult("請輸入有效的滿分和成績");
      return;
    }

    let subjectData;

    if (year === "highest") {
      const highestData = calculateHighestCutoff(subject);
      if (!highestData) {
        setResult("無法找到歷年最高分數線數據");
        return;
      }
      if (paper && highestData[paper]) {
        subjectData = highestData[paper];
      } else if (highestData["total"]) {
        subjectData = highestData["total"];
      } else {
        const firstPaper = Object.keys(highestData)[0];
        subjectData = highestData[firstPaper] || null;
      }
    } else {
      if (!cutoffData[subject] || !cutoffData[subject][year]) {
        setResult("無法找到對應的分數線數據");
        return;
      }
      const yearData = cutoffData[subject][year];

      if (paper && yearData[paper]) {
        subjectData = yearData[paper];
      } else if (yearData["total"]) {
        subjectData = yearData["total"];
      } else {
        const firstPaper = Object.keys(yearData)[0];
        subjectData = yearData[firstPaper] || null;
      }
    }

    if (!subjectData) {
      setResult("無法找到對應的分數線數據");
      return;
    }

    const percentage = (markNum / fullMarkNum) * 100;

    // Sort grades descending by cutoff value, skip nulls
    const sortedGrades = Object.entries(subjectData)
      .filter(([_, val]) => val !== null)
      .sort((a, b) => b[1] - a[1]);

    let grade = "U**"; // default grade if no match

    for (const [gradeKey, cutoffValue] of sortedGrades) {
      if (percentage >= cutoffValue) {
        grade = gradeKey;
        break;
      }
    }

    const cutoffList = sortedGrades.map(([g, v]) => `${g}: ${v}%`).join("\n");

    setResult(
      `你的成績是: ${markNum}/${fullMarkNum}\n百分比: ${percentage.toFixed(
        2
      )}%\n等級: ${grade}\n\n${
        year === "highest" ? "歷年最高" : year + "年"
      }分數線：\n${cutoffList}`
    );
  }

  return (
    <section id="grade-calculator" className="section active">
      <h2>成績計算器</h2>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="year">年份</label>
          <select
            id="year"
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
          <label htmlFor="subject">科目</label>
          <select
            id="subject"
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
      </div>

      <div className="input-row">
        {showPaperGroup && (
          <div className="input-group" id="paper-group">
            <label htmlFor="paper">試卷</label>
            <select
              id="paper"
              value={paper}
              onChange={(e) => setPaper(e.target.value)}
            >
              {(subject === "chi"
                ? ["p1", "p2"]
                : subject === "eng"
                ? ["p1", "p2", "p3", "p4"]
                : []
              ).map((p) => (
                <option key={p} value={p}>
                  試卷 {p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="input-group">
          <label htmlFor="full-mark">試卷 / 滿分</label>
          <input
            type="number"
            id="full-mark"
            placeholder="輸入滿分"
            value={fullMark}
            onChange={(e) => setFullMark(e.target.value)}
            disabled={subject === "chi" || subject === "eng"}
          />
        </div>
      </div>

      <div className="input-row">
        <div className="input-group">
          <label htmlFor="mark">成績</label>
          <input
            type="number"
            id="mark"
            placeholder="輸入成績"
            value={mark}
            onChange={(e) => setMark(e.target.value)}
          />
        </div>
        <div className="input-group">
          <button onClick={calculateGrade}>查詢等級</button>
        </div>
      </div>

      <pre className="result" style={{ whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </section>
  );
}
