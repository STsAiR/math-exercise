import React from "react";

export default function Header({ countdown }) {
  return (
    <header className="main-header">
      <div className="title-section">
        <h1>
          <i className="fas fa-tools"></i> HKDSE Tools 工具
        </h1>
        <p className="subtitle">
          <i className="fas fa-graduation-cap"></i> 為你的未來做好準備
        </p>
      </div>
      <div className="countdown-section">
        <h2>
          <i className="fas fa-hourglass-half"></i> 2026年 DSE 倒數
        </h2>
        <div id="countdown">
          <TimeBlock
            value={countdown.days}
            label="日"
            icon="far fa-calendar-alt"
          />
          <TimeBlock value={countdown.hours} label="時" icon="far fa-clock" />
          <TimeBlock
            value={countdown.minutes}
            label="分"
            icon="fas fa-stopwatch"
          />
          <TimeBlock
            value={countdown.seconds}
            label="秒"
            icon="fas fa-stopwatch-20"
          />
        </div>
        <p className="motivation">
          <i className="fas fa-lightbulb"></i>{" "}
          有種東西你無法透過自身努力得來，這種東西叫「眼界」
        </p>
      </div>
    </header>
  );
}

function TimeBlock({ value, label, icon }) {
  return (
    <div className="time-block">
      <div className="time-value">{value}</div>
      <div className="time-label">
        <i className={icon}></i> {label}
      </div>
    </div>
  );
}
