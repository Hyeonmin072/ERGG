"use client";
import { getGradeColor } from "@/lib/mock";

interface OctagonChartProps {
  scores: {
    combat: number;
    takedown: number;
    hunting: number;
    vision: number;
    mastery: number;
    survival: number;
  };
  grade: string;
  size?: number;
}

const AXES = [
  { key: "combat",   label: "전투",  labelKo: "COMBAT" },
  { key: "takedown", label: "결투",  labelKo: "TAKEDOWN" },
  { key: "hunting",  label: "사냥",  labelKo: "HUNTING" },
  { key: "vision",   label: "시야",  labelKo: "VISION" },
  { key: "mastery",  label: "마스터리", labelKo: "MASTERY" },
  { key: "survival", label: "생존",  labelKo: "SURVIVAL" },
] as const;

function polarToCart(cx: number, cy: number, r: number, angleIdx: number, total: number) {
  // Start from top (-90deg), go clockwise
  const angle = (angleIdx / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

export default function OctagonChart({ scores, grade, size = 300 }: OctagonChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = AXES.length;

  const gradeColor = getGradeColor(grade);

  // Background rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Axis lines
  const axisLines = AXES.map((_, i) => {
    const outer = polarToCart(cx, cy, maxR, i, n);
    return `M ${cx} ${cy} L ${outer.x} ${outer.y}`;
  });

  // Score polygon
  const scoreValues = AXES.map((a) => scores[a.key] / 100);
  const scorePoints = scoreValues
    .map((v, i) => {
      const p = polarToCart(cx, cy, maxR * v, i, n);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  // Label positions (outside maxR)
  const labelR = maxR + 22;
  const labels = AXES.map((axis, i) => {
    const pos = polarToCart(cx, cy, labelR, i, n);
    return { ...pos, ...axis };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background rings */}
        {rings.map((r, ri) => {
          const pts = AXES.map((_, i) => {
            const p = polarToCart(cx, cy, maxR * r, i, n);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={ri}
              points={pts}
              fill="none"
              stroke={ri === rings.length - 1 ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.06)"}
              strokeWidth={ri === rings.length - 1 ? 1.5 : 1}
            />
          );
        })}

        {/* Axis lines */}
        {axisLines.map((d, i) => (
          <path key={i} d={d} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        ))}

        {/* Score fill */}
        <polygon
          points={scorePoints}
          fill={`${gradeColor}22`}
          stroke={gradeColor}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 6px ${gradeColor}88)` }}
        />

        {/* Score dots */}
        {scoreValues.map((v, i) => {
          const p = polarToCart(cx, cy, maxR * v, i, n);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={gradeColor}
              style={{ filter: `drop-shadow(0 0 4px ${gradeColor})` }}
            />
          );
        })}

        {/* Center grade badge */}
        <circle cx={cx} cy={cy} r={28} fill="var(--bg-card)" stroke={gradeColor} strokeWidth={2} />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={gradeColor}
          fontSize={18}
          fontWeight="900"
          style={{ filter: `drop-shadow(0 0 6px ${gradeColor})` }}
        >
          {grade}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8}>
          GRADE
        </text>

        {/* Axis labels */}
        {labels.map((l, i) => (
          <g key={i}>
            <text
              x={l.x}
              y={l.y - 3}
              textAnchor="middle"
              fill="rgba(255,255,255,0.85)"
              fontSize={9}
              fontWeight="700"
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={l.y + 8}
              textAnchor="middle"
              fill={gradeColor}
              fontSize={13}
              fontWeight="900"
            >
              {Math.round(scores[l.key])}
            </text>
          </g>
        ))}
      </svg>

      {/* Score bars */}
      <div className="w-full grid grid-cols-2 gap-x-6 gap-y-1.5 px-4">
        {AXES.map((axis) => {
          const val = scores[axis.key];
          return (
            <div key={axis.key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span style={{ color: "var(--text-secondary)" }}>{axis.label}</span>
                <span style={{ color: gradeColor }}>{Math.round(val)}</span>
              </div>
              <div
                className="h-1 rounded-full"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: `${val}%`,
                    background: `linear-gradient(90deg, ${gradeColor}88, ${gradeColor})`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
