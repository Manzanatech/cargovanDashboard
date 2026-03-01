import { useMemo, useState } from 'react';

const viewOptions = [
  { label: 'Top', icon: '/images/view-top.svg' },
  { label: 'Side', icon: '/images/view-side.svg' },
  { label: 'Split', icon: '/images/view-split.svg' },
];

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
  selectedTopCategoryId,
  onTopCategorySelect,
  topCategoryLabels,
  onTopCategoryLabelsChange
}) {
  const [editingTopLabelId, setEditingTopLabelId] = useState(null);
  const [topLabelDraft, setTopLabelDraft] = useState('');
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

  return (
    <div className="load-plan">
      <p className="eyebrow">Load plan diagram</p>
      <div className="diagram">
        <div className="diagram-content">
          <p className="diagram-title">Ford Transit | 350 HD</p>
          {activeView === 'Top' && (
            <div className="top-sketch-frame">
              <TopVanUnderlay />
              <div className="top-sketch-left">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function TopVanUnderlay() {
  return (
    <svg
      className="top-van-underlay"
      viewBox="0 0 1500 620"
      role="img"
      aria-label="Cargo van top-view silhouette"
      preserveAspectRatio="none"
    >
      <path
        className="top-van-fill"
        d="M1388 108 C1420 108 1446 134 1446 166 V454 C1446 486 1420 512 1388 512 H500
           C360 512 260 456 200 380 C178 352 166 330 166 310 C166 290 178 268 200 240
           C260 164 360 108 500 108 H1388 Z"
      />
      <path
        className="top-van-border"
        d="M1388 108 C1420 108 1446 134 1446 166 V454 C1446 486 1420 512 1388 512 H500
           C360 512 260 456 200 380 C178 352 166 330 166 310 C166 290 178 268 200 240
           C260 164 360 108 500 108 H1388 Z"
      />
      <path
        className="top-van-shell"
        d="M1368 126 C1398 126 1420 148 1420 178 V442 C1420 472 1398 494 1368 494 H514
           C384 494 290 442 236 368 C218 344 208 326 208 310 C208 294 218 276 236 252
           C290 178 384 126 514 126 H1368 Z"
      />

      <path className="top-van-cab" d="M498 130 C374 130 286 176 236 244 C220 266 212 286 212 310" />
      <path className="top-van-cab" d="M498 490 C374 490 286 444 236 376 C220 354 212 334 212 310" />
      <path className="top-van-cab soft" d="M482 154 C380 154 308 194 268 248 C252 270 244 288 244 310" />
      <path className="top-van-cab soft" d="M482 466 C380 466 308 426 268 372 C252 350 244 332 244 310" />
      <path className="top-van-cab soft" d="M458 178 C376 178 320 210 288 254 C274 272 268 290 268 310" />
      <path className="top-van-cab soft" d="M458 442 C376 442 320 410 288 366 C274 348 268 330 268 310" />

      <line className="top-van-cab" x1="430" y1="132" x2="430" y2="488" />
      <line className="top-van-cab soft" x1="468" y1="144" x2="468" y2="476" />

      <line className="top-van-shell soft" x1="516" y1="126" x2="1368" y2="126" />
      <line className="top-van-shell soft" x1="516" y1="494" x2="1368" y2="494" />

      <line className="top-van-rear" x1="1342" y1="130" x2="1342" y2="490" />
      <line className="top-van-rear soft" x1="1368" y1="146" x2="1368" y2="474" />
      <line className="top-van-rear soft" x1="1392" y1="166" x2="1392" y2="454" />
    </svg>
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
