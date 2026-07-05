import { useState } from "react";

import { RadialChart } from "multi-layer-radial-chart";
import type { RadialDatum } from "multi-layer-radial-chart";
import "multi-layer-radial-chart/styles.css";

const data: RadialDatum[] = [
  { label: "Move", value: 82, max: 100, color: "#fb2576" },
  { label: "Exercise", value: 45, max: 60, color: "#22d3ee" },
  { label: "Stand", value: 9, max: 12, color: "#a3e635" },
];

export function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: "system-ui, sans-serif",
        background: "#0b0b0f",
        color: "#f5f5f4",
      }}
    >
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>multi-layer-radial-chart</h1>

      <RadialChart
        data={data}
        size={280}
        showLegend
        showTooltip
        onSegmentClick={(datum) => setSelected(datum.label)}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: 34, fontWeight: 700 }}>82%</span>
          <span style={{ fontSize: 11, letterSpacing: "0.18em", opacity: 0.6 }}>
            DAILY GOAL
          </span>
        </div>
      </RadialChart>

      <p style={{ fontSize: 13, opacity: 0.7, minHeight: 18 }}>
        {selected ? `Selected: ${selected}` : "Click a ring (or Tab + Enter)"}
      </p>
    </main>
  );
}
