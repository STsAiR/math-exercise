import React, { useState, useEffect } from "react";
import { subjects } from "../constants";

export default function AnswerSearch() {
  const currentYear = new Date().getFullYear() + 1;

  const [yearOptions, setYearOptions] = useState([]);
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const years = Array.from({ length: currentYear - 2013 }, (_, i) => {
      const y = (currentYear - 1 - i).toString();
      return { value: y, label: y };
    });
    setYearOptions(years);
    setYear(years[0]?.value || "");
    setSubject(Object.keys(subjects)[0] || "");
  }, [currentYear]);

  function generateUrl(type, year, subject) {
    const baseUrl = process.env.PUBLIC_URL || "";
    const fileName = type === "ans" ? "answer" : "";
    const subjectPath = subject === "m0" ? "m0" : subject;
    return `${baseUrl}/${subjectPath}/${year}/${fileName}.pdf`;
  }

  function searchAnswer() {
    if (!year || !subject) return;
    const url = generateUrl("ans", year, subject);
    window.open(url, "_blank");
  }

  return (
    <section id="answer-search" className="section active">
      <h2>答案搜尋</h2>
      <div className="input-group">
        <label htmlFor="search-answer-year">選擇年份</label>
        <select
          id="search-answer-year"
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
        <label htmlFor="search-answer-subject">選擇科目</label>
        <select
          id="search-answer-subject"
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

      <button onClick={searchAnswer}>
        <i className="fas fa-search"></i> 搜尋答案
      </button>
    </section>
  );
}
