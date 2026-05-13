"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "var(--font-geist-sans), Inter, sans-serif",
  mindmap: {
    padding: 15
  }
});

export default function Mermaid({ chart, id = "mermaid-chart" }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const renderChart = async () => {
      try {
        if (!chart) return;
        setError(false);
        setSvgContent(""); // Clear previous

        const { svg } = await mermaid.render(`${id}-svg`, chart);

        if (!isCancelled) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        if (!isCancelled) {
          setError(true);
        }
      }
    };

    renderChart();

    return () => {
      isCancelled = true;
    };
  }, [chart, id]);

  if (!chart) return null;

  return (
    <div className="mermaid-container" style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', overflowX: 'auto', padding: '20px', background: 'var(--bg-white)', borderRadius: '12px', border: '1px solid var(--border)', minHeight: '300px', alignItems: 'center' }}>
      {error ? (
        <div style={{ color: 'var(--danger)', textAlign: 'center' }}>
          <p>Failed to render mind map.</p>
          <pre style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px', textAlign: 'left', background: 'var(--danger-bg)', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>
            {chart}
          </pre>
        </div>
      ) : svgContent ? (
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      ) : (
        <div className="spinner"></div>
      )}
    </div>
  );
}
