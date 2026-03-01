export default function TopCategoryPanel({
  selectedSlotCode,
  rowLetter,
  selectedCategoryName,
  entries
}) {
  return (
    <aside className="detail-panel top-category-panel">
      <div className="detail-card">
        <div className="detail-top">
          <div>
            <p className="eyebrow">Top View Categories</p>
            <p className="detail-position-code">{selectedSlotCode}</p>
          </div>
          <span className="detail-count">Row {rowLetter}</span>
        </div>

        <div className="detail-box">
          <div className="detail-header">
            <p className="detail-title">{selectedCategoryName}</p>
          </div>

          <div className="detail-list">
            {entries.map((entry) => (
              <div key={entry.id} className="detail-item-row">
                <div className="detail-item-meta">
                  <span className="detail-item-name">{entry.category}</span>
                  <span className="detail-item-qty">{entry.code}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="top-panel-note">
            Click any category label on the top map to rename it.
          </p>
        </div>
      </div>
    </aside>
  );
}
