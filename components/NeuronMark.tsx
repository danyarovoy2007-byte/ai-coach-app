"use client";
import React from "react";

type Size = "sm" | "md" | "lg" | "xl";

export function NeuronMark({
  size = "md",
  animated = true,
  color = "#C8A0A0",
  stroke = "#3D2B1F",
}: {
  size?: Size;
  animated?: boolean;
  color?: string;
  stroke?: string;
}) {
  const dims: Record<Size, [number, number]> = {
    sm: [56, 28],
    md: [88, 44],
    lg: [160, 80],
    xl: [240, 120],
  };
  const [w, h] = dims[size];
  const r = h * 0.18;
  const cx1 = r + 2;
  const cx2 = w - r - 2;
  const cy = h / 2;
  const ctrlY = cy - h * 0.32;

  const uid = `nm-${size}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id={`${uid}-pulse`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="40%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter
          id={`${uid}-glow`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* axon curve */}
      <path
        d={`M ${cx1} ${cy} Q ${w / 2} ${ctrlY}, ${cx2} ${cy}`}
        fill="none"
        stroke={stroke}
        strokeOpacity="0.35"
        strokeWidth="1.2"
        strokeDasharray={animated ? "180" : "0"}
        strokeDashoffset={animated ? "180" : "0"}
        style={
          animated
            ? { animation: "nm-line 3s var(--ease-in) infinite" }
            : undefined
        }
      />

      {/* left node */}
      <circle
        cx={cx1}
        cy={cy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
      />

      {/* right node */}
      <circle
        cx={cx2}
        cy={cy}
        r={r}
        fill={color}
        fillOpacity={animated ? 0 : 1}
        stroke={color}
        strokeWidth="1.5"
        style={
          animated
            ? { animation: "nm-rnode 3s var(--ease-in) infinite" }
            : undefined
        }
      />
      {animated && (
        <circle
          cx={cx2}
          cy={cy}
          r={r * 1.6}
          fill={color}
          opacity="0"
          style={{
            animation: "nm-rglow 3s var(--ease-in) infinite",
            filter: `url(#${uid}-glow)`,
          }}
        />
      )}

      {/* pulse */}
      {animated && (
        <g style={{ animation: "nm-pulse 3s var(--ease-in) infinite" }}>
          <circle r={r * 0.55} fill={`url(#${uid}-pulse)`}>
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              keyTimes="0;0.15;0.65;1"
              keyPoints="0;0;1;1"
              calcMode="spline"
              keySplines="0.42 0 1 1; 0.22 1 0.36 1; 0.42 0 1 1"
              path={`M ${cx1} ${cy} Q ${w / 2} ${ctrlY}, ${cx2} ${cy}`}
            />
          </circle>
        </g>
      )}
    </svg>
  );
}
