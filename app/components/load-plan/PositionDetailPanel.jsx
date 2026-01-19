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

  useEffect(() => {
    setIsEditingName(false);
    setNameDraft(shelf.displayName);
    setItemName('');
    setItemQty('');
    setError('');
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
          <p className="eyebrow">Selected position</p>
          <span className="detail-count">{shelf.items.length} / 20</span>
        </div>
        <div className="detail-name-row">
          {!isEditingName ? (
            <>
              <span className="detail-name">{shelf.displayName}</span>
              <button
                type="button"
                className="detail-name-button"
                onClick={() => setIsEditingName(true)}
              >
                Edit
              </button>
            </>
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
        <div className="detail-box">
          <div className="detail-header">
            <p className="detail-title">Shelf items</p>
            {helperText && <span className="detail-helper">{helperText}</span>}
          </div>
          <div className="detail-list">
            {shelf.items.length === 0 ? (
              <p className="detail-empty">No items assigned to this shelf.</p>
            ) : (
              shelf.items.map((item) => (
                <div key={item.id} className="detail-item-row">
                  <span className="detail-item-name">{item.name}</span>
                  <div className="detail-item-meta">
                    {typeof item.qty === 'number' && (
                      <span className="detail-item-qty">Qty {item.qty}</span>
                    )}
                    <button
                      type="button"
                      className="detail-remove"
                      onClick={() => onRemoveItem(shelf.id, item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="detail-add-form">
            <label className="detail-add-field">
              <span className="detail-label">Item name</span>
              <input
                className="detail-input"
                type="text"
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
              />
            </label>
            <label className="detail-add-field">
              <span className="detail-label">Qty (optional)</span>
              <input
                className="detail-input"
                type="number"
                min="1"
                value={itemQty}
                onChange={(event) => setItemQty(event.target.value)}
              />
            </label>
            <div className="detail-add-actions">
              <button
                type="button"
                className="detail-add"
                onClick={handleAddItem}
                disabled={!canAdd}
              >
                Add item
              </button>
            </div>
            {isQtyInvalid && (
              <p className="detail-error">Quantity must be a positive number.</p>
            )}
            {error && <p className="detail-error">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
