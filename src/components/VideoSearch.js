import React, { useState, useEffect } from "react";
import { subjects } from "../constants";

export default function VideoSearch() {
  const currentYear = new Date().getFullYear() + 1;

  const [yearOptions, setYearOptions] = useState([]);
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    const years = Array.from({ length: currentYear - 2013 }, (_, i) => {
      const y = (currentYear - 1 - i).toString();
      return { value: y, label: y };
    });
    setYearOptions(years);
    setYear(years[0]?.value || "");
    setSubject(Object.keys(subjects)[0] || "");
  }, [currentYear]);

  function searchVideo() {
    if (!year || !subject) return;
    const subjectText = subjects[subject];
    let searchQuery = `HKDSE ${year} ${subjectText}`;
    if (topic) searchQuery += ` ${topic}`;

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery
    )}`;
    window.open(searchUrl, "_blank");
  }

  return (
    <section id="video-search" className="section active">
      <h2>影片搜尋</h2>
      <div className="input-group">
        <label htmlFor="video-year">選擇年份</label>
        <select
          id="video-year"
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
        <label htmlFor="video-subject">選擇科目</label>
        <select
          id="video-subject"
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

      <div className="input-group">
        <label htmlFor="video-topic">關鍵字（可選）</label>
        <input
          type="text"
          id="video-topic"
          placeholder="輸入關鍵字"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      <button onClick={searchVideo}>
        <i className="fas fa-video"></i> 搜尋影片
      </button>
    </section>
  );
}
