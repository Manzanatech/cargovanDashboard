export default function PositionDetail({
  shelf,
  onNameChange,
  onItemChange,
  onAddEntry
}) {
  const filledItems = shelf.contents
    .map((value, index) => ({ value, index }))
    .filter((item) => item.value.trim().length > 0);

  return (
    <div className="detail-panel">
      <div className="detail-card">
        <p className="eyebrow">Selected position</p>
        <input
          className="detail-input"
          type="text"
          value={shelf.label}
          onChange={(event) => onNameChange(event.target.value)}
        />
        <div className="detail-box">
          <div className="detail-header">
            <p className="detail-title">{shelf.trade}</p>
            <button type="button" className="detail-add" onClick={onAddEntry}>
              Add entry
            </button>
          </div>
          <div className="detail-list">
            {filledItems.map((item) => (
              <input
                key={`${shelf.id}-item-${item.index}`}
                className="detail-item-input"
                type="text"
                value={item.value}
                onChange={(event) => onItemChange(item.index, event.target.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}