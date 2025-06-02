import React from "react";

export default function Nav({ activeSection, setActiveSection }) {
  const navItems = [
    { id: "grade-calculator", icon: "fas fa-calculator", label: "成績計算器" },
    { id: "answer-search", icon: "fas fa-search", label: "答案搜尋" },
    { id: "video-search", icon: "fas fa-video", label: "影片搜尋" },
    { id: "paper-opener", icon: "fas fa-file-alt", label: "試卷開啟器" },
    { id: "exercise-opener", icon: "fas fa-pencil-alt", label: "練習題開啟器" },
    // Add exercise extract here if needed
  ];
  return (
    <nav>
      <ul>
        {navItems.map(({ id, icon, label }) => (
          <li key={id}>
            <a
              href="#!"
              className={activeSection === id ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(id);
              }}
              data-section={id}
            >
              <i className={icon}></i> {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
