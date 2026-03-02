import { useEffect, useMemo, useRef, useState } from 'react';

const viewOptions = [
  { label: 'Top', icon: '/images/view-top.svg' },
  { label: 'Side', icon: '/images/view-side.svg' },
  { label: 'Split', icon: '/images/view-split.svg' },
];
const TOP_UNDERLAY_SVG_VERSION = 'v3.3';
const TOP_VIEWBOX = { width: 600, height: 300 };
const CENTER_BLOCK_TARGET = { x: -20, y: 196 };

const topCategoryLayout = {
  left: [
    { id: 'top-left-1', code: 'CA' },
    { id: 'top-left-2', code: 'CB' },
    { id: 'top-left-3', code: 'CC' },
    { id: 'top-left-4', code: 'CD' }
  ],
  top: [
    { id: 'top-1', code: 'RA' },
    { id: 'top-2', code: 'RB' },
    { id: 'top-3', code: 'RC', name: 'Electrical' },
    { id: 'top-4', code: 'RD', name: 'Black Pipe' },
    { id: 'top-5', code: 'RE', name: 'PVC' }
  ],
  bottom: [
    { id: 'bottom-1', code: 'LA' },
    { id: 'bottom-2', code: 'LB' },
    { id: 'bottom-3', code: 'LC' },
    { id: 'bottom-4', code: 'LD' },
    { id: 'bottom-5', code: 'LE' }
  ]
};

const shortCategory = (name) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

const allTopSlots = [
  ...topCategoryLayout.left,
  ...topCategoryLayout.top,
  ...topCategoryLayout.bottom
];

export const initialTopCategoryLabels = Object.fromEntries(
  allTopSlots.map((slot) => [slot.id, slot.name ?? 'Category'])
);

export { topCategoryLayout };

export default function LoadPlanDiagram({
  shelves,
  selectedId,
  onSelect,
  activeView,
  onViewChange,
  showDebugOverlay = true,
  onToggleDebugOverlay,
  selectedTopCategoryId,
  onTopCategorySelect,
  topCategoryLabels,
  onTopCategoryLabelsChange
}) {
  const topSketchRef = useRef(null);
  const [editingTopLabelId, setEditingTopLabelId] = useState(null);
  const [topLabelDraft, setTopLabelDraft] = useState('');
  const [topSketchSize, setTopSketchSize] = useState({ width: 0, height: 0 });
  const [underlayBoxSize, setUnderlayBoxSize] = useState({ width: 0, height: 0 });
  const [underlayImageSize, setUnderlayImageSize] = useState({ width: 0, height: 0 });
  const [centerBlockOffset, setCenterBlockOffset] = useState({ x: 0, y: 0 });
  const [topBlockAnchors, setTopBlockAnchors] = useState({
    left: null,
    center: null,
    right: null
  });
  const getShelfStatus = (shelf) => (shelf.items.length ? 'assigned' : 'empty');
  const getColumn = (shelfId) => shelfId.slice(-1);
  const centerColumns = new Set(['C']);
  const rowOrder = ['5', '4', '3', '2'];
  const colOrder = ['A', 'B', 'C', 'D', 'E'];

  const orderedShelves = useMemo(() => {
    const rank = (shelfId) => {
      const row = shelfId[0];
      const col = shelfId.slice(-1);
      return rowOrder.indexOf(row) * 10 + colOrder.indexOf(col);
    };
    return [...shelves].sort((a, b) => rank(a.id) - rank(b.id));
  }, [shelves]);

  const splitShelves = useMemo(
    () => ({
      center: orderedShelves.filter((shelf) => centerColumns.has(getColumn(shelf.id))).slice(0, 3),
      right: orderedShelves,
      left: orderedShelves
    }),
    [orderedShelves]
  );

  const getTopLabel = (slotId) => topCategoryLabels?.[slotId]?.trim() || 'Category';

  const startTopLabelEdit = (slotId) => {
    setEditingTopLabelId(slotId);
    setTopLabelDraft(getTopLabel(slotId));
  };

  const commitTopLabelEdit = () => {
    if (!editingTopLabelId) return;
    const nextValue = topLabelDraft.trim() || 'Category';
    onTopCategoryLabelsChange({
      ...topCategoryLabels,
      [editingTopLabelId]: nextValue
    });
    setEditingTopLabelId(null);
    setTopLabelDraft('');
  };

  const cancelTopLabelEdit = () => {
    setEditingTopLabelId(null);
    setTopLabelDraft('');
  };

  const measureBlockAnchor = (frameNode, selector) => {
    const items = Array.from(frameNode.querySelectorAll(selector));
    if (!items.length) return null;
    const frameRect = frameNode.getBoundingClientRect();
    const rects = items.map((node) => node.getBoundingClientRect());
    const minLeft = Math.min(...rects.map((rect) => rect.left));
    const maxRight = Math.max(...rects.map((rect) => rect.right));
    const minTop = Math.min(...rects.map((rect) => rect.top));
    const maxBottom = Math.max(...rects.map((rect) => rect.bottom));
    const x = Math.round((minLeft + maxRight) / 2 - frameRect.left);
    const y = Math.round((minTop + maxBottom) / 2 - frameRect.top);
    return { x, y };
  };

  useEffect(() => {
    if (activeView !== 'Top') return;
    const node = topSketchRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setTopSketchSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
      const nextAnchors = {
        left: measureBlockAnchor(node, '.top-sketch-left .top-category-slot'),
        center: measureBlockAnchor(
          node,
          '.top-sketch-main .top-sketch-row .top-slot-cell:not(:last-child) .top-category-slot'
        ),
        right: measureBlockAnchor(
          node,
          '.top-sketch-main .top-sketch-row .top-slot-cell:last-child .top-category-slot'
        )
      };
      setTopBlockAnchors(nextAnchors);

      if (nextAnchors.left) {
        const dx = CENTER_BLOCK_TARGET.x - nextAnchors.left.x;
        const dy = CENTER_BLOCK_TARGET.y - nextAnchors.left.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          setCenterBlockOffset((prev) => ({
            x: Math.round((prev.x + dx) * 10) / 10,
            y: Math.round((prev.y + dy) * 10) / 10
          }));
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeView]);

  return (
    <div className="load-plan">
      <p className="eyebrow">Load plan diagram</p>
      <div className="diagram">
        <div className="diagram-content">
          <p className="diagram-title">Ford Transit | 350 HD</p>
          {activeView === 'Top' && (
            <div
              className={`top-sketch-frame ${showDebugOverlay ? 'debug-on' : 'debug-off'}`}
              ref={topSketchRef}
            >
              <TopVanUnderlay
                onBoxSizeChange={setUnderlayBoxSize}
                onImageSizeChange={setUnderlayImageSize}
              />
              {showDebugOverlay && (
                <TopAlignmentGuide
                  width={topSketchSize.width}
                  height={topSketchSize.height}
                  underlayBoxWidth={underlayBoxSize.width}
                  underlayBoxHeight={underlayBoxSize.height}
                  underlayWidth={underlayImageSize.width}
                  underlayHeight={underlayImageSize.height}
                  blockAnchors={topBlockAnchors}
                />
              )}
              <div className="top-shelf-clip">
                <div className="top-shelf-overlay">
                  <div
                    className="top-sketch-left"
                    style={{
                      transform: `translate(${centerBlockOffset.x}px, ${centerBlockOffset.y}px)`
                    }}
                  >
                    {topCategoryLayout.left.map((slot) => (
                      <TopCategoryShelf
                        key={slot.id}
                        slotId={slot.id}
                        slotCode={slot.code}
                        label={getTopLabel(slot.id)}
                        labelPlacement="top"
                        labelOrientation="horizontal"
                        labelVariant="center-stack"
                        selected={selectedTopCategoryId === slot.id}
                        onSelect={onTopCategorySelect}
                        onStartEdit={startTopLabelEdit}
                        isEditing={editingTopLabelId === slot.id}
                        draft={topLabelDraft}
                        onDraftChange={setTopLabelDraft}
                        onCommit={commitTopLabelEdit}
                        onCancel={cancelTopLabelEdit}
                      />
                    ))}
                  </div>
                  <div className="top-sketch-main">
                    <div className="top-sketch-row">
                      {topCategoryLayout.top.map((slot) => (
                        <TopCategoryShelf
                          key={slot.id}
                          slotId={slot.id}
                          slotCode={slot.code}
                          label={getTopLabel(slot.id)}
                          labelPlacement="below"
                          labelOrientation="vertical"
                          labelVariant="top-right"
                          selected={selectedTopCategoryId === slot.id}
                          onSelect={onTopCategorySelect}
                          onStartEdit={startTopLabelEdit}
                          isEditing={editingTopLabelId === slot.id}
                          draft={topLabelDraft}
                          onDraftChange={setTopLabelDraft}
                          onCommit={commitTopLabelEdit}
                          onCancel={cancelTopLabelEdit}
                        />
                      ))}
                    </div>
                    <p className="top-sketch-aisle">AISLE</p>
                    <div className="top-sketch-row">
                      {topCategoryLayout.bottom.map((slot) => (
                        <TopCategoryShelf
                          key={slot.id}
                          slotId={slot.id}
                          slotCode={slot.code}
                          label={getTopLabel(slot.id)}
                          labelPlacement="top"
                          labelOrientation="vertical"
                          selected={selectedTopCategoryId === slot.id}
                          onSelect={onTopCategorySelect}
                          onStartEdit={startTopLabelEdit}
                          isEditing={editingTopLabelId === slot.id}
                          draft={topLabelDraft}
                          onDraftChange={setTopLabelDraft}
                          onCommit={commitTopLabelEdit}
                          onCancel={cancelTopLabelEdit}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeView === 'Side' && (
            <div className="diagram-shell side-layout">
              <div className="ladder-rack">
                <span className="ladder-label">Ladder rack</span>
              </div>
            </div>
          )}
          {activeView === 'Split' && (
            <div className="diagram-split sketched-split">
              <aside className="split-cab-panel">
                <p className="split-front-label">Front ←</p>
                <div className="split-cab-layout" aria-hidden="true">
                  <div className="split-windshield-wrap">
                    <span className="split-dashboard" />
                    <span className="split-windshield" />
                  </div>
                  <div className="split-seat-strip">
                    <span className="seat-pill seat-top" />
                    <span className="seat-pill seat-bottom" />
                  </div>
                </div>
              </aside>

              <section className="split-main-panel">
                <div className="split-cargo-core">
                  <div className="split-center-stack cargo-center">
                    <p className="split-label">Center shelves</p>
                    <div className="split-grid split-grid-center">
                      {splitShelves.center.map((shelf) => (
                        <button
                          key={`center-${shelf.id}`}
                          type="button"
                          className={`position ${getShelfStatus(shelf)}${
                            shelf.id === selectedId ? ' selected' : ''
                          }`}
                          onClick={() => onSelect(shelf.id)}
                        >
                          <span className="position-name">C-{shelf.displayName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="split-side-halves">
                    <div className="split-panel">
                      <p className="split-label">Right side shelves</p>
                      <div className="split-grid">
                        {splitShelves.right.map((shelf) => (
                          <button
                            key={`right-${shelf.id}`}
                            type="button"
                            className={`position ${getShelfStatus(shelf)}${
                              shelf.id === selectedId ? ' selected' : ''
                            }`}
                            onClick={() => onSelect(shelf.id)}
                          >
                            <span className="position-name">R-{shelf.displayName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="split-aisle-label">AISLE</p>
                    <div className="split-panel split-panel-left">
                      <div className="split-grid">
                        {splitShelves.left.map((shelf) => (
                          <button
                            key={`left-${shelf.id}`}
                            type="button"
                            className={`position ${getShelfStatus(shelf)}${
                              shelf.id === selectedId ? ' selected' : ''
                            }`}
                            onClick={() => onSelect(shelf.id)}
                          >
                            <span className="position-name">L-{shelf.displayName}</span>
                          </button>
                        ))}
                      </div>
                      <p className="split-label split-label-bottom">Left side shelves</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
          <div className="view-selector">
            <p className="label">Van Views</p>
            <div className="view-buttons">
              {viewOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`view-button${activeView === option.label ? ' active' : ''}`}
                  onClick={() => onViewChange(option.label)}
                >
                  <img
                    className="view-button-icon"
                    src={option.icon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`debug-toggle${showDebugOverlay ? ' active' : ''}`}
              onClick={() => onToggleDebugOverlay?.()}
            >
              {showDebugOverlay ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopAlignmentGuide({
  width,
  height,
  underlayBoxWidth,
  underlayBoxHeight,
  underlayWidth,
  underlayHeight,
  blockAnchors
}) {
  const zoneTicks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="top-align-guide" aria-hidden="true">
      <div className="top-cargo-guide-zone">
        <span className="top-cargo-guide-label">Cargo guide</span>
        <div className="top-cargo-ruler top-cargo-ruler-x">
          {zoneTicks.map((tick) => (
            <span
              key={`cargo-x-${tick}`}
              className="top-cargo-ruler-tick top-cargo-ruler-tick-x"
              style={{ left: `${tick}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <div className="top-cargo-ruler top-cargo-ruler-y">
          {zoneTicks.map((tick) => (
            <span
              key={`cargo-y-${tick}`}
              className="top-cargo-ruler-tick top-cargo-ruler-tick-y"
              style={{ top: `${tick}%` }}
            >
              {tick}
            </span>
          ))}
        </div>
        <span className="top-cargo-guide-axis axis-x-mid" />
        <span className="top-cargo-guide-axis axis-y-mid" />
      </div>
      {blockAnchors?.left && (
        <span
          className="top-cargo-block-label"
          style={{ left: `${blockAnchors.left.x}px`, top: `${blockAnchors.left.y}px` }}
        >
          Center Shelves ({blockAnchors.left.x}px, {blockAnchors.left.y}px)
        </span>
      )}
      {blockAnchors?.center && (
        <span
          className="top-cargo-block-label"
          style={{ left: `${blockAnchors.center.x}px`, top: `${blockAnchors.center.y}px` }}
        >
          Left Side Shelves ({blockAnchors.center.x}px, {blockAnchors.center.y}px)
        </span>
      )}
      {blockAnchors?.right && (
        <span
          className="top-cargo-block-label"
          style={{ left: `${blockAnchors.right.x}px`, top: `${blockAnchors.right.y}px` }}
        >
          Right Side Shelves ({blockAnchors.right.x}px, {blockAnchors.right.y}px)
        </span>
      )}

      <div className="top-viewbox-readout">
        <span className="top-viewbox-pill">viewBox W: {TOP_VIEWBOX.width}</span>
        <span className="top-viewbox-pill">viewBox H: {TOP_VIEWBOX.height}</span>
      </div>
      <div className="top-dimension-readout" data-container-size={`${width || 0}x${height || 0}`}>
        <span className="top-dimension-pill">Container W: {width || 0}px</span>
        <span className="top-dimension-pill">Container H: {height || 0}px</span>
      </div>
      <div className="top-underlay-box-readout">
        <span className="top-underlay-box-pill">Underlay Box W: {underlayBoxWidth || 0}px</span>
        <span className="top-underlay-box-pill">Underlay Box H: {underlayBoxHeight || 0}px</span>
      </div>
      <div className="top-underlay-readout">
        <span className="top-underlay-pill">Underlay W: {underlayWidth || 0}px</span>
        <span className="top-underlay-pill">Underlay H: {underlayHeight || 0}px</span>
      </div>
      <div className="top-debug-legend" aria-hidden="true">
        <p className="top-debug-legend-title">Debug Key</p>
        <span className="top-debug-legend-item">
          <span className="top-debug-swatch swatch-cargo" />
          Cargo zone overlay
        </span>
        <span className="top-debug-legend-item">
          <span className="top-debug-swatch swatch-underlay-box" />
          Underlay box
        </span>
        <span className="top-debug-legend-item">
          <span className="top-debug-swatch swatch-underlay-image" />
          Underlay image
        </span>
        <span className="top-debug-legend-item">
          <span className="top-debug-swatch swatch-shelves" />
          Shelf clip area
        </span>
        <span className="top-debug-legend-item">
          <span className="top-debug-swatch swatch-rulers" />
          Rulers and guides
        </span>
        <span className="top-debug-legend-item">
          <span className="top-debug-swatch swatch-readouts" />
          Size readouts
        </span>
      </div>

    </div>
  );
}

function TopVanUnderlay({ onBoxSizeChange, onImageSizeChange }) {
  const underlayBoxRef = useRef(null);
  const underlayImageRef = useRef(null);

  useEffect(() => {
    const node = underlayBoxRef.current;
    if (!node || typeof ResizeObserver === 'undefined' || typeof onBoxSizeChange !== 'function') {
      return;
    }

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      onBoxSizeChange({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onBoxSizeChange]);

  useEffect(() => {
    const node = underlayImageRef.current;
    if (!node || typeof ResizeObserver === 'undefined' || typeof onImageSizeChange !== 'function') {
      return;
    }

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      onImageSizeChange({
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onImageSizeChange]);

  return (
    <div className="top-van-underlay" aria-hidden="true" ref={underlayBoxRef}>
      <img
        ref={underlayImageRef}
        className="top-van-underlay-image"
        src={`/images/van_layout_productionV3.svg?${TOP_UNDERLAY_SVG_VERSION}`}
        alt=""
        draggable="false"
      />
      <svg
        className="top-cargo-zone-svg"
        viewBox="90 85 600 300"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <path
          className="top-cargo-zone-path"
          d="M260 130H650a12 12 0 0 1 12 12v186a12 12 0 0 1-12 12H260Z"
        />
        <text className="top-cargo-zone-text" x="644" y="145">
          Cargo Zone
        </text>
      </svg>
    </div>
  );
}

function TopCategoryShelf({
  slotId,
  slotCode,
  label,
  labelPlacement = 'top',
  labelOrientation = 'vertical',
  labelVariant = '',
  selected,
  onSelect,
  onStartEdit,
  isEditing,
  draft,
  onDraftChange,
  onCommit,
  onCancel
}) {
  const isPlaceholder = label === 'Category';

  return (
    <div
      className={`top-slot-cell ${labelPlacement === 'below' ? 'label-below' : ''} ${
        labelVariant ? `variant-${labelVariant}` : ''
      }`}
    >
      {isEditing ? (
        <input
          className={`top-category-input ${labelPlacement === 'below' ? 'below' : ''} ${
            labelVariant ? `variant-${labelVariant}` : ''
          }`}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') onCommit();
            if (event.key === 'Escape') onCancel();
          }}
          autoFocus
        />
      ) : (
        <button
          type="button"
          className={`top-category-tag ${isPlaceholder ? 'placeholder' : ''} ${
            labelOrientation === 'horizontal' ? 'horizontal' : ''
          } ${labelPlacement === 'below' ? 'below' : ''} ${
            labelVariant ? `variant-${labelVariant}` : ''
          }`}
          title={label}
          onClick={(event) => {
            event.stopPropagation();
            onStartEdit(slotId);
          }}
        >
          {label}
        </button>
      )}
      <button
        type="button"
        className={`position top-category-slot ${selected ? ' selected' : ''}`}
        onClick={() => onSelect(slotId)}
      >
        <span className="position-name">{slotCode ?? shortCategory(label)}</span>
      </button>
    </div>
  );
}
