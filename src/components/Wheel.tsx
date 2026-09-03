import { SLICE_COLORS } from '../constants'

type WheelProps = {
  names: string[]
  rotation: number
  spinning: boolean
}

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number): string {
  const [x1, y1] = polar(cx, cy, r, start)
  const [x2, y2] = polar(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

function contrastColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const luma = (r * 299 + g * 587 + b * 114) / 1000
  return luma < 150 ? '#fffaf3' : '#2a2118'
}

function fitName(name: string, count: number): string {
  const max = count <= 6 ? 14 : count <= 10 ? 11 : count <= 14 ? 8 : 6
  if (name.length <= max) return name
  return `${name.slice(0, Math.max(1, max - 1))}…`
}

export function Wheel({ names, rotation, spinning }: WheelProps) {
  const size = 520
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8
  const count = Math.max(names.length, 1)
  const slice = 360 / count

  return (
    <div className={`wheel-stage ${spinning ? 'is-spinning' : ''}`}>
      <div className="wheel-pointer" aria-hidden="true" />
      <div className="wheel-rotate" style={{ transform: `rotate(${rotation}deg)` }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="wheel-svg" role="img" aria-label="Moderator wheel">
          <circle cx={cx} cy={cy} r={r + 6} fill="#f3e6d0" />
          {names.length === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="#e8dfd2" />
          ) : (
            names.map((name, i) => {
              const start = -90 + i * slice
              const end = start + slice
              const mid = start + slice / 2
              const color = SLICE_COLORS[i % SLICE_COLORS.length]
              const textR = r * (count > 12 ? 0.68 : 0.62)
              const [tx, ty] = polar(cx, cy, textR, mid)
              const norm = ((mid % 360) + 360) % 360
              const flip = norm > 90 && norm < 270
              const fontSize = Math.max(9, Math.min(16, 150 / count))
              return (
                <g key={`${name}-${i}`}>
                  <path d={slicePath(cx, cy, r, start, end)} fill={color} stroke="#fffaf3" strokeWidth="2" />
                  <text
                    x={tx}
                    y={ty}
                    fill={contrastColor(color)}
                    fontSize={fontSize}
                    fontWeight={700}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${flip ? mid + 180 : mid} ${tx} ${ty})`}
                  >
                    {fitName(name, count)}
                  </text>
                </g>
              )
            })
          )}
          <circle cx={cx} cy={cy} r={42} fill="#fffaf3" stroke="#e8b86d" strokeWidth="4" />
          <circle cx={cx} cy={cy} r={14} fill="#4cb3e8" />
        </svg>
      </div>
    </div>
  )
}
