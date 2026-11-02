// Hand-drawn botanical line art for the guest invitation, in the spirit of blue engraved stationery.
// Every path uses pathLength="1" so CSS can draw it in with a dash offset when the piece is revealed.

const LEAF = "M0 0C7-7 19-8 27 0C19 7 7 7 0 0Z";
const SPRIG_LEAVES = [[27, 182, -125], [33, 168, -28], [47, 143, -122], [57, 128, -18], [71, 104, -132], [80, 84, -32], [85, 62, -118], [94, 46, -22], [107, 27, -112]];

// Two branches fanning from the bottom-left of the box; CSS places and flips it per corner.
export function Sprig({ className = "" }) {
  return <svg className={`sprig ${className}`} viewBox="0 0 220 220" aria-hidden="true" data-reveal="draw">
    <g className="sprig-sway">
      <g transform="translate(20 215) rotate(52) scale(.72) translate(-20 -215)"><Branch delay={3}/></g>
      <Branch delay={0}/>
    </g>
  </svg>;
}

function Branch({ delay }) {
  return <>
    <path className="stem" pathLength="1" d="M20 215C30 160 70 122 80 82S102 30 125 8"/>
    <path className="stem" pathLength="1" d="M58 127C78 117 96 122 108 114"/>
    {SPRIG_LEAVES.map(([x, y, angle], index) => <Leaf key={index} x={x} y={y} angle={angle} index={index + delay}/>)}
    <Blossom x={125} y={10} r={10} index={9 + delay}/>
    <Blossom x={110} y={113} r={7} index={6 + delay}/>
  </>;
}

// A centred flower with a tendril to each side, used as the chapter divider.
export function Bloom({ className = "" }) {
  return <svg className={`bloom ${className}`} viewBox="0 0 200 40" aria-hidden="true" data-reveal="draw">
    <path className="stem" pathLength="1" d="M88 20C72 12 54 28 36 20S14 15 4 21"/>
    <path className="stem" pathLength="1" d="M112 20C128 12 146 28 164 20S186 15 196 21"/>
    <Leaf x={70} y={17} angle={-150} index={2}/>
    <Leaf x={46} y={23} angle={160} index={4}/>
    <Leaf x={130} y={17} angle={-30} index={2}/>
    <Leaf x={154} y={23} angle={20} index={4}/>
    <Blossom x={100} y={20} r={11} index={0}/>
  </svg>;
}

function Leaf({ x, y, angle, index }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}><path className="leaf" d={LEAF} style={{ "--i": index }}/></g>;
}

function Blossom({ x, y, r, index }) {
  return <g transform={`translate(${x} ${y})`}><g className="blossom" style={{ "--i": index }}>
    {[0, 72, 144, 216, 288].map((angle) => <ellipse key={angle} cy={-r * .58} rx={r * .4} ry={r * .6} transform={`rotate(${angle})`}/>)}
    <circle r={r * .24}/>
  </g></g>;
}
