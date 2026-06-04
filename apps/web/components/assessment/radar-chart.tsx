interface Score {
  label: string;
  score: number;
}

interface Props {
  scores: Score[];
}

const CX = 220;
const CY = 210;
const R = 150;
const LABEL_R = 175;

function pointAt(fraction: number, index: number, total: number): [number, number] {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return [CX + fraction * R * Math.cos(angle), CY + fraction * R * Math.sin(angle)];
}

function polygonPoints(fraction: number, total: number): string {
  return Array.from({ length: total }, (_, i) => pointAt(fraction, i, total).join(",")).join(" ");
}

function textAnchor(x: number): "start" | "middle" | "end" {
  if (x < CX - 5) return "end";
  if (x > CX + 5) return "start";
  return "middle";
}

export default function RadarChart({ scores }: Props) {
  const N = scores.length;
  if (N < 3) return null;

  const dataPoints = scores.map(({ score }, i) => pointAt(score / 100, i, N).join(",")).join(" ");

  return (
    <svg
      viewBox="-80 -20 600 460"
      width="100%"
      style={{ maxWidth: 420 }}
      aria-hidden="true"
    >
      {/* gridlines at 33%, 66%, 100% */}
      {[0.33, 0.66, 1].map((fraction) => (
        <polygon
          key={fraction}
          points={polygonPoints(fraction, N)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* axes */}
      {scores.map((_, i) => {
        const [x, y] = pointAt(1, i, N);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      })}

      {/* data polygon */}
      <polygon
        points={dataPoints}
        fill="#22c55e"
        fillOpacity={0.2}
        stroke="#22c55e"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* axis labels */}
      {scores.map(({ label }, i) => {
        const [x, y] = pointAt(LABEL_R / R, i, N);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={12}
            fill="currentColor"
            textAnchor={textAnchor(x)}
            dominantBaseline="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
