'use client';

import { useEffect, useMemo, useState } from 'react';
import DispatchWarnings from './components/DispatchWarnings';
import Footer from './components/Footer';
import LoadPlanDiagram from './components/LoadPlanDiagram';
import PositionDetailPanel from './components/load-plan/PositionDetailPanel';
import { dashboardMeta, shelves as initialShelves, warnings } from './components/load-plan/mockData';

const createItemId = (name) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function Home() {
  const [timestamp, setTimestamp] = useState('just now');
  const [selectedId, setSelectedId] = useState('5E');
  const [shelves, setShelves] = useState(initialShelves);

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      setTimestamp(formatted);
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 60000);
    return () => clearInterval(interval);
  }, []);

  const selectedShelf = useMemo(
    () => shelves.find((shelf) => shelf.id === selectedId) ?? shelves[0],
    [selectedId, shelves]
  );

  const handleSelectShelf = (id) => {
    setSelectedId(id);
  };

  const handleUpdateShelfName = (id, nextName) => {
    setShelves((prev) =>
      prev.map((shelf) => (shelf.id === id ? { ...shelf, displayName: nextName } : shelf))
    );
  };

  const handleAddShelfItem = (id, nextItem) => {
    const trimmedName = nextItem.name.trim();
    if (!trimmedName) {
      return { error: 'Item name is required.' };
    }
    const qtyValue = typeof nextItem.qty === 'number' ? nextItem.qty : 1;
    if (!Number.isFinite(qtyValue) || qtyValue <= 0) {
      return { error: 'Quantity must be a positive number.' };
    }

    let error = null;
    setShelves((prev) =>
      prev.map((shelf) => {
        if (shelf.id !== id) {
          return shelf;
        }

        const existingIndex = shelf.items.findIndex(
          (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingIndex >= 0) {
          const nextItems = shelf.items.map((item, index) => {
            if (index !== existingIndex) {
              return item;
            }
            return {
              ...item,
              qty: (item.qty ?? 1) + qtyValue
            };
          });
          return { ...shelf, items: nextItems };
        }

        if (shelf.items.length >= 20) {
          error = 'Shelf full (20 / 20)';
          return shelf;
        }

        return {
          ...shelf,
          items: [
            ...shelf.items,
            {
              id: createItemId(trimmedName),
              name: trimmedName,
              qty: qtyValue
            }
          ]
        };
      })
    );
    if (error) {
      return { error };
    }
    return { error: null };
  };

  const handleRemoveShelfItem = (id, itemId) => {
    setShelves((prev) =>
      prev.map((shelf) =>
        shelf.id === id
          ? { ...shelf, items: shelf.items.filter((item) => item.id !== itemId) }
          : shelf
      )
    );
  };

  return (
    <div className="app-shell">
      <main className="main">
        <header className="page-header">
          <div>
            <p className="eyebrow">{dashboardMeta.hub}</p>
            <h2>{dashboardMeta.route}</h2>
          </div>
          <span className="pill neutral">{dashboardMeta.status}</span>
        </header>

        <section className="plan-board">
          <div className="plan-board-content">
            <LoadPlanDiagram
              shelves={shelves}
              selectedId={selectedId}
              onSelect={handleSelectShelf}
            />
            {selectedShelf && (
              <PositionDetailPanel
                shelf={selectedShelf}
                onUpdateName={handleUpdateShelfName}
                onAddItem={handleAddShelfItem}
                onRemoveItem={handleRemoveShelfItem}
              />
            )}
          </div>
        </section>

        <DispatchWarnings warnings={warnings} />

        <Footer timestamp={timestamp} />
      </main>
    </div>
  );
}
