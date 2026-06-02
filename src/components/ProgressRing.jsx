import React, { memo } from "react";

const R = 50;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * Animated SVG progress ring. Wrapped in React.memo so it only re-renders
 * when `percent` or `label` actually changes.
 */
const ProgressRing = memo(function ProgressRing({ percent, label }) {
  const strokeOffset = CIRCUMFERENCE - (CIRCUMFERENCE * percent) / 100;
  const color = percent === 100 ? "#34C759" : "#F5C533";

  return (
    <div className="progress-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={R}
          stroke="rgba(84,84,88,0.35)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="60" cy="60" r={R}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          transform="rotate(-90 60 60)"
          style={{
            transition: "stroke-dashoffset 0.6s cubic-bezier(0.25,0.46,0.45,0.94), stroke 0.4s ease",
          }}
        />
        <text x="60" y="56" textAnchor="middle" fontSize="20" fill="#FFFFFF" fontWeight="700" fontFamily="system-ui">
          {percent}%
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="10" fill="rgba(235,235,245,0.45)" fontFamily="system-ui">
          {label}
        </text>
      </svg>
    </div>
  );
});

export default ProgressRing;
