import { useMemo, useState } from 'react';

const viewOptions = ['Top', 'Side', 'Split'];

export default function LoadPlanDiagram({ shelves, selectedId, onSelect }) {
  const [view, setView] = useState('Top');

  const [leftShelves, rightShelves] = useMemo(() => {
    const midpoint = Math.ceil(shelves.length / 2);
    return [shelves.slice(0, midpoint), shelves.slice(midpoint)];
  }, [shelves]);

  const topShelves = useMemo(() => {
    const topRows = new Set(['5', '4']);
    return shelves.filter((shelf) => topRows.has(shelf.label[0]));
  }, [shelves]);

  return (
    <div className="load-plan">
      <p className="eyebrow">Load plan diagram</p>
      <div className="diagram">
        <div className="diagram-content">
          <p className="diagram-title">Ford Transit | 350 HD</p>
          {view === 'Top' && (
            <div className="diagram-grid">
              {topShelves.map((shelf) => (
                <button
                  key={shelf.id}
                  type="button"
                  className={`position ${shelf.status}${shelf.id === selectedId ? ' selected' : ''}`}
                  onClick={() => onSelect(shelf.id)}
                >
                  <span className="position-name">{shelf.label}</span>
                </button>
              ))}
            </div>
          )}
          {view === 'Side' && (
            <div className="diagram-shell side-layout">
              <div className="ladder-rack">
                <span className="ladder-label">Ladder rack</span>
              </div>
            </div>
          )}
          {view === 'Split' && (
            <div className="diagram-split">
              <p className="split-direction">Front ← Rear</p>
              <div className="split-panel">
                <p className="split-label">Left side shelves</p>
                <div className="split-grid">
                  {shelves.map((shelf) => (
                    <button
                      key={`left-${shelf.id}`}
                      type="button"
                      className={`position ${shelf.status}${shelf.id === selectedId ? ' selected' : ''}`}
                      onClick={() => onSelect(shelf.id)}
                    >
                      <span className="position-name">{shelf.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="split-panel">
                <p className="split-label">Right side shelves</p>
                <div className="split-grid">
                  {shelves.map((shelf) => (
                    <button
                      key={`right-${shelf.id}`}
                      type="button"
                      className={`position ${shelf.status}${shelf.id === selectedId ? ' selected' : ''}`}
                      onClick={() => onSelect(shelf.id)}
                    >
                      <span className="position-name">{shelf.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="view-selector">
            <p className="label">Van Views</p>
            <div className="view-buttons">
              {viewOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`view-button${view === option ? ' active' : ''}`}
                  onClick={() => setView(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="payload-strip">
        <div className="payload-info">
          <p className="label">Payload / Balance</p>
          <p className="meta">Front 49% · Rear 51%</p>
        </div>
        <div className="balance-meter">
          <span className="balance-label">Front</span>
          <div className="balance-track">
            <span className="balance-marker ok" style={{ left: '52%' }} />
          </div>
          <span className="balance-label">Rear</span>
        </div>
        <span className="pill neutral">OK</span>
      </div>
    </div>
  );
}