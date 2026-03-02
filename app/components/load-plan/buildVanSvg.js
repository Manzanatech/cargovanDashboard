/**
 * @typedef {Object} SeatConfig
 * @property {number} pivotX
 * @property {number} pivotY
 * @property {number} baseTranslateX
 * @property {number} baseTranslateY
 * @property {number} seatWidth
 * @property {number} seatDepth
 * @property {number} backrestWidth
 * @property {number} backrestDepth
 */

/**
 * @typedef {Object} VanLayoutConfig
 * @property {{name?: string, version?: string, orientation?: string, units?: string}=} meta
 * @property {{width: number, height: number}} canvas
 * @property {{
 *   frontRadius: number,
 *   rearRadius: number,
 *   topEdgeY: number,
 *   bottomEdgeY: number,
 *   leftMostX: number,
 *   rightMostX: number,
 *   cabSeamX: number
 * }} van
 * @property {{
 *   columnX: number,
 *   upper: {anchorY: number, rotationDeg: number, flip: "none"|"vertical"|"horizontal", attachedEdge?: string},
 *   lower: {anchorY: number, rotationDeg: number, flip: "none"|"vertical"|"horizontal", attachedEdge?: string},
 *   opacity: number
 * }} mirrors
 * @property {{
 *   opacity: number,
 *   rotationDeg: number,
 *   driver: SeatConfig,
 *   passenger: SeatConfig
 * }} seats
 * @property {{enabled: boolean, minorSpacing: number, majorSpacing: number}=} grid
 * @property {{enabled: boolean}=} rulers
 */

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function mirrorPathD() {
  return "M0,0 l-22,-10 c-8,-4 -14,7 -8,13 l12,12 c5,5 12,2 18,-1 z";
}

function seatRects(seat) {
  const cushion = `<rect x="0" y="18" width="${seat.seatWidth}" height="${seat.seatDepth}" rx="10"/>`;
  const backrestX = Math.max(0, Math.round((seat.seatWidth - seat.backrestWidth) / 2));
  const backrest = `<rect x="${backrestX}" y="0" width="${seat.backrestWidth}" height="${seat.backrestDepth}" rx="10"/>`;
  return `${cushion}
        ${backrest}`;
}

function flipTransform(flip) {
  if (flip === "vertical") return '<g transform="scale(1,-1)">';
  if (flip === "horizontal") return '<g transform="scale(-1,1)">';
  return "";
}

function flipClose(flip) {
  return flip === "none" ? "" : "</g>";
}

/**
 * @param {VanLayoutConfig} cfg
 */
export function buildVanSvg(cfg) {
  const { width, height } = cfg.canvas;
  const v = cfg.van;

  const left = v.leftMostX;
  const right = v.rightMostX;
  const top = v.topEdgeY;
  const bottom = v.bottomEdgeY;
  const frontR = v.frontRadius;
  const rearR = v.rearRadius;

  const frontArcX = left + frontR;
  const rearArcX = right - rearR;
  const rearTopY = top + rearR;
  const rearBottomY = bottom - rearR;
  const frontTopY = top;
  const frontBottomY = bottom;
  const frontInnerTopY = top + frontR;
  const frontInnerBottomY = bottom - frontR;

  const vanPath = [
    `M${v.cabSeamX},${top}`,
    `L${rearArcX},${top}`,
    `A${rearR},${rearR} 0 0 1 ${right},${rearTopY}`,
    `L${right},${rearBottomY}`,
    `A${rearR},${rearR} 0 0 1 ${rearArcX},${bottom}`,
    `L${frontArcX},${bottom}`,
    `A${frontR},${frontR} 0 0 1 ${left},${frontInnerBottomY}`,
    `L${left},${frontInnerTopY}`,
    `A${frontR},${frontR} 0 0 1 ${frontArcX},${frontTopY}`,
    `L${v.cabSeamX},${top}`,
    "Z"
  ].join("\n        ");

  const gridDefs = cfg.grid?.enabled
    ? `
  <defs>
    <pattern id="grid10" width="${cfg.grid.minorSpacing}" height="${cfg.grid.minorSpacing}" patternUnits="userSpaceOnUse">
      <path d="M${cfg.grid.minorSpacing} 0H0V${cfg.grid.minorSpacing}" fill="none" stroke="#f2f2f2" stroke-width="1"/>
    </pattern>
    <pattern id="grid50" width="${cfg.grid.majorSpacing}" height="${cfg.grid.majorSpacing}" patternUnits="userSpaceOnUse">
      <path d="M${cfg.grid.majorSpacing} 0H0V${cfg.grid.majorSpacing}" fill="none" stroke="#d9d9d9" stroke-width="1.1"/>
    </pattern>
  </defs>
  <g id="grid">
    <rect width="${width}" height="${height}" fill="url(#grid10)"/>
    <rect width="${width}" height="${height}" fill="url(#grid50)"/>
  </g>`
    : "";

  const m = cfg.mirrors;
  const upperMirror = `
  <g id="mirror-upper" transform="translate(${m.columnX} ${m.upper.anchorY}) rotate(${m.upper.rotationDeg})">
    ${flipTransform(m.upper.flip)}<path d="${mirrorPathD()}"/>${flipClose(m.upper.flip)}
  </g>`;

  const lowerMirror = `
  <g id="mirror-lower" transform="translate(${m.columnX} ${m.lower.anchorY}) rotate(${m.lower.rotationDeg})">
    ${flipTransform(m.lower.flip)}<path d="${mirrorPathD()}"/>${flipClose(m.lower.flip)}
  </g>`;

  const s = cfg.seats;
  const driver = `
    <g id="seat-driver" transform="rotate(${s.rotationDeg} ${s.driver.pivotX} ${s.driver.pivotY})">
      <g transform="translate(${s.driver.baseTranslateX} ${s.driver.baseTranslateY})">
        ${seatRects(s.driver)}
      </g>
    </g>`;

  const passenger = `
    <g id="seat-passenger" transform="rotate(${s.rotationDeg} ${s.passenger.pivotX} ${s.passenger.pivotY})">
      <g transform="translate(${s.passenger.baseTranslateX} ${s.passenger.baseTranslateY})">
        ${seatRects(s.passenger)}
      </g>
    </g>`;

  const rulersNote = cfg.rulers?.enabled
    ? "\n  <!-- rulers: enabled (add full ruler markup if needed) -->"
    : "";

  const title = esc(cfg.meta?.name ?? "cargo-van-layout");

  return `<svg xmlns="http://www.w3.org/2000/svg"
     class="generated-van-svg"
     viewBox="0 0 ${width} ${height}"
     preserveAspectRatio="none"
     role="img"
     aria-label="${title}">
${gridDefs}
  <g id="van-outline">
    <path fill="none" stroke="black" stroke-width="4" stroke-linejoin="round"
          d="
        ${vanPath}
          "/>
  </g>

  <line id="cab-seam"
        x1="${v.cabSeamX}" y1="${top}"
        x2="${v.cabSeamX}" y2="${bottom}"
        stroke="black" stroke-width="3" stroke-dasharray="6 6"/>

  <line id="vehicle-centerline"
        x1="80" y1="${(top + bottom) / 2}"
        x2="690" y2="${(top + bottom) / 2}"
        stroke="#8c8c8c" stroke-width="2" stroke-dasharray="8 6"/>

  <g id="mirrors" opacity="${m.opacity}" stroke="#444" stroke-width="2" fill="none">
    ${upperMirror}
    ${lowerMirror}
  </g>

  <g id="seats" opacity="${s.opacity}" stroke="#555" stroke-width="1.6" fill="none">
    ${driver}
    ${passenger}
  </g>
${rulersNote}
</svg>`;
}

/** @type {VanLayoutConfig} */
export const defaultVanLayoutConfig = {
  meta: { name: "cargo-van-layout", version: "v1", orientation: "top", units: "px" },
  canvas: { width: 760, height: 470 },
  van: {
    frontRadius: 60,
    rearRadius: 12,
    topEdgeY: 95,
    bottomEdgeY: 305,
    leftMostX: 120,
    rightMostX: 662,
    cabSeamX: 260
  },
  mirrors: {
    columnX: 225,
    upper: { anchorY: 95, rotationDeg: 90, flip: "none", attachedEdge: "top" },
    lower: { anchorY: 305, rotationDeg: 270, flip: "vertical", attachedEdge: "bottom" },
    opacity: 0
  },
  seats: {
    opacity: 0,
    rotationDeg: 90,
    driver: {
      pivotX: 225,
      pivotY: 146,
      baseTranslateX: 190,
      baseTranslateY: 120,
      seatWidth: 70,
      seatDepth: 34,
      backrestWidth: 58,
      backrestDepth: 18
    },
    passenger: {
      pivotX: 225,
      pivotY: 254,
      baseTranslateX: 190,
      baseTranslateY: 228,
      seatWidth: 70,
      seatDepth: 34,
      backrestWidth: 58,
      backrestDepth: 18
    }
  },
  grid: { enabled: false, minorSpacing: 10, majorSpacing: 50 },
  rulers: { enabled: false }
};
