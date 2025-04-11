import React from "react";

export default function StyledSlider({ value, onChange, min = 0, max = 10, step = 1 }) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="rating-scale">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="rating-slider"
        style={{
          background: `linear-gradient(to right, #f5c84c ${percent}%, #2a2f58 ${percent}%)`,
        }}
      />
      <div className="rating-value">{value}</div>
    </div>
  );
}
