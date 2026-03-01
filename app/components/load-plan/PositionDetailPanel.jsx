import { useEffect, useMemo, useState } from 'react';

export default function PositionDetailPanel({
  shelf,
  onUpdateName,
  onAddItem,
  onRemoveItem
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(shelf.displayName);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [error, setError] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    setIsEditingName(false);
    setNameDraft(shelf.displayName);
    setItemName('');
    setItemQty('');
    setError('');
    setSelectedItemId(shelf.items[0]?.id ?? null);
  }, [shelf.id, shelf.displayName]);

  const shelfFull = shelf.items.length >= 20;
  const trimmedName = itemName.trim();
  const qtyValue = itemQty.trim();
  const isQtyInvalid =
    qtyValue.length > 0 && (!Number.isFinite(Number(qtyValue)) || Number(qtyValue) <= 0);
  const canAdd = trimmedName.length > 0 && !isQtyInvalid && !shelfFull;

  const helperText = useMemo(() => {
    if (shelfFull) {
      return 'Shelf full (20 / 20)';
    }
    return '';
  }, [shelfFull]);

  const utilization = Math.min(100, Math.round((shelf.items.length / 20) * 100));
  const itemRows = shelf.items.map((item, index) => ({
    ...item,
    laneLabel: `POS ${shelf.id}`,
    tone: ['tone-a', 'tone-b', 'tone-c'][index % 3]
  }));

  const handleSaveName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setError('Display name cannot be empty.');
      return;
    }
    onUpdateName(shelf.id, trimmed);
    setIsEditingName(false);
    setError('');
  };

  const handleAddItem = () => {
    const result = onAddItem(shelf.id, {
      name: trimmedName,
      qty: qtyValue.length > 0 ? Number(qtyValue) : undefined
    });
    if (result?.error) {
      setError(result.error);
      return;
    }
    setItemName('');
    setItemQty('');
    setError('');
  };

  return (
    <div className="detail-panel">
      <div className="detail-card">
        <div className="detail-top">
          <div>
            <p className="eyebrow">Selected position</p>
            <p className="detail-position-code">{shelf.displayName}</p>
          </div>
          <span className="detail-count">{shelf.items.length} / 20</span>
        </div>
        <div className="detail-capacity">
          <div className="detail-capacity-track">
            <span className="detail-capacity-marker" style={{ left: `${utilization}%` }} />
          </div>
          <p className="detail-capacity-text">Capacity usage {utilization}%</p>
        </div>
        <div className="detail-box">
          <div className="detail-header">
            <p className="detail-title">Parts Tracker</p>
            {helperText && <span className="detail-helper">{helperText}</span>}
          </div>
          <div className="detail-list">
            {shelf.items.length === 0 ? (
              <p className="detail-empty">No items assigned to this shelf.</p>
            ) : (
              itemRows.map((item) => (
                <div
                  key={item.id}
                  className={`detail-item-row ${selectedItemId === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItemId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setSelectedItemId(item.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="detail-item-meta">
                    <span className={`detail-item-dot ${item.tone}`} />
                    <div>
                      <span className="detail-item-name">{item.name}</span>
                      {typeof item.qty === 'number' && (
                        <span className="detail-item-qty">Qty {item.qty}</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-item-actions">
                    <span className="detail-lane-chip">{item.laneLabel}</span>
                    <button
                      type="button"
                      className="detail-remove"
                      onClick={() => onRemoveItem(shelf.id, item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="detail-toolbar">
            {!isEditingName ? (
              <button
                type="button"
                className="detail-name-button"
                onClick={() => setIsEditingName(true)}
              >
                Rename Position
              </button>
            ) : (
              <div className="detail-name-edit">
                <input
                  className="detail-input"
                  type="text"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                />
                <div className="detail-name-actions">
                  <button type="button" className="detail-name-button" onClick={handleSaveName}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="detail-name-button secondary"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameDraft(shelf.displayName);
                      setError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="detail-add-form">
            <label className="detail-add-field">
              <span className="detail-label">Add package</span>
              <input
                className="detail-input"
                type="text"
                value={itemName}
                placeholder="Package name"
                onChange={(event) => setItemName(event.target.value)}
              />
            </label>
            <label className="detail-add-field">
              <span className="detail-label">Qty</span>
              <input
                className="detail-input"
                type="number"
                min="1"
                value={itemQty}
                placeholder="1"
                onChange={(event) => setItemQty(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="detail-add"
              onClick={handleAddItem}
              disabled={!canAdd}
            >
              Add to Parts Tracker
            </button>
            {isQtyInvalid && <p className="detail-error">Quantity must be a positive number.</p>}
            {error && <p className="detail-error">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
