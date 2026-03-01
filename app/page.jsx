'use client';

import { useEffect, useMemo, useState } from 'react';
import DispatchWarnings from './components/DispatchWarnings';
import Footer from './components/Footer';
import LoadPlanDiagram, {
  initialTopCategoryLabels,
  topCategoryLayout
} from './components/LoadPlanDiagram';
import PositionDetailPanel from './components/load-plan/PositionDetailPanel';
import TopCategoryPanel from './components/load-plan/TopCategoryPanel';
import { dashboardMeta, shelves as initialShelves, warnings } from './components/load-plan/mockData';

const TOP_CATEGORY_LABELS_STORAGE_KEY = 'cargoVan.topCategoryLabels.v1';

const createItemId = (name) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function Home() {
  const [timestamp, setTimestamp] = useState('just now');
  const [activeView, setActiveView] = useState('Top');
  const [selectedId, setSelectedId] = useState('5E');
  const [shelves, setShelves] = useState(initialShelves);
  const [selectedTopCategoryId, setSelectedTopCategoryId] = useState(topCategoryLayout.top[2].id);
  const [topCategoryLabels, setTopCategoryLabels] = useState(initialTopCategoryLabels);

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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TOP_CATEGORY_LABELS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      setTopCategoryLabels((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Keep defaults if storage is unavailable or malformed.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        TOP_CATEGORY_LABELS_STORAGE_KEY,
        JSON.stringify(topCategoryLabels)
      );
    } catch {
      // Ignore persistence failures (private mode, disabled storage, etc).
    }
  }, [topCategoryLabels]);

  const selectedShelf = useMemo(
    () => shelves.find((shelf) => shelf.id === selectedId) ?? shelves[0],
    [selectedId, shelves]
  );

  const topSlots = useMemo(
    () => [...topCategoryLayout.left, ...topCategoryLayout.top, ...topCategoryLayout.bottom],
    []
  );

  const topSlotById = useMemo(
    () => Object.fromEntries(topSlots.map((slot) => [slot.id, slot])),
    [topSlots]
  );

  const selectedTopSlot = topSlotById[selectedTopCategoryId] ?? topSlots[0];
  const selectedRowLetter = selectedTopSlot?.code?.slice(-1) ?? 'A';
  const selectedTopCategoryRaw = topCategoryLabels[selectedTopCategoryId]?.trim() || '';
  const selectedTopCategoryName =
    !selectedTopCategoryRaw || selectedTopCategoryRaw === 'Category'
      ? 'No Category'
      : selectedTopCategoryRaw;

  const selectedVerticalRow = useMemo(() => {
    const codes = [`R${selectedRowLetter}`, `C${selectedRowLetter}`, `L${selectedRowLetter}`];
    return topSlots
      .filter((slot) => codes.includes(slot.code))
      .map((slot) => ({
        id: slot.id,
        code: slot.code,
        category: (() => {
          const value = topCategoryLabels[slot.id]?.trim() || '';
          return !value || value === 'Category' ? 'No Category' : value;
        })()
      }));
  }, [topSlots, selectedRowLetter, topCategoryLabels]);

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
              activeView={activeView}
              onViewChange={setActiveView}
              selectedTopCategoryId={selectedTopCategoryId}
              onTopCategorySelect={setSelectedTopCategoryId}
              topCategoryLabels={topCategoryLabels}
              onTopCategoryLabelsChange={setTopCategoryLabels}
            />
            {activeView === 'Top' ? (
              <TopCategoryPanel
                selectedSlotCode={selectedTopSlot?.code ?? 'RA'}
                rowLetter={selectedRowLetter}
                selectedCategoryName={selectedTopCategoryName}
                entries={selectedVerticalRow}
              />
            ) : (
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
