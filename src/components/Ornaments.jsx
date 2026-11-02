// Hand-drawn botanical line art for the guest invitation, in the spirit of blue engraved stationery.
// Every stem uses pathLength="1" so CSS can draw it in with a dash offset when the piece is revealed.

const LEAF = "M0 0C7-7 19-8 27 0C19 7 7 7 0 0Z";
const SPRIG_LEAVES = [[27, 182, -125], [33, 168, -28], [47, 143, -122], [57, 128, -18], [71, 104, -132], [80, 84, -32], [85, 62, -118], [94, 46, -22], [107, 27, -112]];

// Flowers per sprig: [main tip, main side, fan tip, fan side]. Each corner mixes two kinds.
const BOUQUETS = {
  melati: ["jasmine", "berries", "daisy", "jasmine"],
  mawar: ["rose", "jasmine", "tulip", "berries"],
  aster: ["daisy", "tulip", "jasmine", "daisy"],
  tulip: ["tulip", "daisy", "rose", "jasmine"],
};

// Two branches fanning from the bottom-left of the box; CSS places and flips it per corner.
export function Sprig({ className = "", bouquet = "melati" }) {
  const [tip, side, fanTip, fanSide] = BOUQUETS[bouquet];
  return <svg className={`sprig ${className}`} viewBox="0 0 220 220" aria-hidden="true" data-reveal="draw">
    <g className="sprig-sway">
      <g transform="translate(20 215) rotate(52) scale(.72) translate(-20 -215)"><Branch delay={3} tip={fanTip} side={fanSide}/></g>
      <Branch delay={0} tip={tip} side={side}/>
    </g>
  </svg>;
}

function Branch({ delay, tip, side }) {
  return <>
    <path className="stem" pathLength="1" d="M20 215C30 160 70 122 80 82S102 30 125 8"/>
    <path className="stem" pathLength="1" d="M58 127C78 117 96 122 108 114"/>
    {SPRIG_LEAVES.map(([x, y, angle], index) => <Leaf key={index} x={x} y={y} angle={angle} index={index + delay}/>)}
    <Flower kind={side} x={60} y={124} r={10} angle={-20} index={4 + delay}/>
    <Flower kind={side} x={110} y={113} r={13} angle={75} index={6 + delay}/>
    <Flower kind={tip} x={125} y={10} r={19} angle={35} index={9 + delay}/>
  </>;
}

// A centred flower with a tendril to each side, used as the chapter divider.
export function Bloom({ className = "", kind = "jasmine" }) {
  return <svg className={`bloom ${className}`} viewBox="0 0 200 40" aria-hidden="true" data-reveal="draw">
    <path className="stem" pathLength="1" d="M88 20C72 12 54 28 36 20S14 15 4 21"/>
    <path className="stem" pathLength="1" d="M112 20C128 12 146 28 164 20S186 15 196 21"/>
    <Leaf x={70} y={17} angle={-150} index={2}/>
    <Leaf x={46} y={23} angle={160} index={4}/>
    <Leaf x={130} y={17} angle={-30} index={2}/>
    <Leaf x={154} y={23} angle={20} index={4}/>
    <Flower kind="berries" x={30} y={20} r={6} index={5}/>
    <Flower kind="berries" x={170} y={20} r={6} index={5}/>
    <Flower kind={kind} x={100} y={20} r={12} index={0}/>
  </svg>;
}

function Leaf({ x, y, angle, index }) {
  return <g transform={`translate(${x} ${y}) rotate(${angle})`}><path className="leaf" d={LEAF} style={{ "--i": index }}/></g>;
}

// Every kind is drawn around 0,0 with radius r; tulips point up and turn by `angle` to follow the stem.
function Flower({ kind, x, y, r, angle = 0, index }) {
  return <g transform={`translate(${x} ${y}) rotate(${kind === "tulip" ? angle : 0})`}><g className={`blossom blossom-${kind}`} style={{ "--i": index }}>
    {SHAPES[kind](r)}
  </g></g>;
}

const SHAPES = {
  jasmine: (r) => <>
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} className="petal" cy={-r * .58} rx={r * .4} ry={r * .6} transform={`rotate(${a})`}/>)}
    <circle className="heart" r={r * .24}/>
  </>,
  daisy: (r) => <>
    {Array.from({ length: 12 }, (_, i) => <ellipse key={i} className="petal" cy={-r * .58} rx={r * .17} ry={r * .48} transform={`rotate(${i * 30})`}/>)}
    <circle className="heart" r={r * .3}/>
  </>,
  rose: (r) => <>
    <path className="petal" d={`M0 ${-r}C${r * .6} ${-r} ${r} ${-r * .55} ${r * .95} 0S${r * .55} ${r} 0 ${r}${-r} ${r * .55} ${-r * .95} 0${-r * .5} ${-r} 0 ${-r}Z`}/>
    <path className="petal-line" d={`M${r * .55} ${-r * .1}A${r * .55} ${r * .55} 0 1 1 ${-r * .2} ${-r * .5}M${-r * .3} 0A${r * .3} ${r * .3} 0 1 1 0 ${r * .3}`}/>
  </>,
  tulip: (r) => <path className="petal" d={`M0 ${r * .7}C${-r * .75} ${r * .4} ${-r * .75} ${-r * .45} ${-r * .48} ${-r * .85}L${-r * .16} ${-r * .38}L0 ${-r * .95}L${r * .16} ${-r * .38}L${r * .48} ${-r * .85}C${r * .75} ${-r * .45} ${r * .75} ${r * .4} 0 ${r * .7}Z`}/>,
  berries: (r) => <>
    <circle className="berry" cx={-r * .38} cy={r * .2} r={r * .34}/>
    <circle className="berry" cx={r * .38} cy={r * .26} r={r * .3}/>
    <circle className="berry" cy={-r * .36} r={r * .32}/>
  </>,
};
