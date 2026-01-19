'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DispatchWarnings from './components/DispatchWarnings';
import Footer from './components/Footer';
import LoadPlanDiagram from './components/LoadPlanDiagram';
import PositionDetail from './components/PositionDetail';
import { dashboardMeta, shelves as initialShelves, warnings } from './data/loadPlan';
import { supabase } from '../lib/supabaseClient';

const entryFields = [
  { key: 'quantity', label: 'Quantity', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'description', label: 'Description', type: 'text', multiline: true },
  { key: 'partNumber', label: 'Part number', type: 'text' },
  { key: 'cost', label: 'Approx. cost', type: 'text' }
];

const defaultEntry = {
  quantity: '',
  name: '',
  category: '',
  description: '',
  partNumber: '',
  cost: ''
};

export default function Home() {
  const [timestamp, setTimestamp] = useState('just now');
  const [selectedId, setSelectedId] = useState('shelf-5E');
  const [shelves, setShelves] = useState(initialShelves);
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [entryDraft, setEntryDraft] = useState(defaultEntry);
  const saveTimeoutsRef = useRef(new Map());

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
    const shelf = shelves.find((item) => item.id === id);
    setSelectedId(id);
    setEntryDraft(shelf?.entry ?? defaultEntry);
    setIsEntryOpen(true);
  };

  const handleAddEntry = () => {
    const shelf = shelves.find((item) => item.id === selectedId);
    setEntryDraft(shelf?.entry ?? defaultEntry);
    setIsEntryOpen(true);
  };

  const handleShelfNameChange = (nextName) => {
    setShelves((prev) =>
      prev.map((shelf) =>
        shelf.id === selectedId ? { ...shelf, label: nextName } : shelf
      )
    );
  };

  const handleShelfItemChange = (index, nextValue) => {
    let updatedShelf = null;
    setShelves((prev) =>
      prev.map((shelf) => {
        if (shelf.id !== selectedId) {
          return shelf;
        }

        const nextContents = [...shelf.contents];
        nextContents[index] = nextValue;
        updatedShelf = { ...shelf, contents: nextContents };
        return updatedShelf;
      })
    );
    if (updatedShelf) {
      scheduleShelfSave(updatedShelf);
    }
  };

  const buildSummary = (entry) => {
    const summaryParts = [
      entry.quantity && entry.name
        ? `${entry.quantity} × ${entry.name}`
        : entry.name || entry.quantity,
      entry.category ? `(${entry.category})` : null,
      entry.partNumber ? `PN ${entry.partNumber}` : null,
      entry.cost ? entry.cost : null,
      entry.description ? entry.description : null
    ].filter(Boolean);
    return summaryParts.join(' · ');
  };

  const persistShelfToSupabase = async (shelf, summaryOverride) => {
    if (!supabase) {
      console.warn('Supabase client unavailable; shelf entry stored locally only.');
      return;
    }

    const summary = summaryOverride ?? buildSummary(shelf.entry ?? defaultEntry);
    const payload = {
      shelf_id: shelf.id,
      shelf_label: shelf.label,
      entry: shelf.entry ?? defaultEntry,
      contents: shelf.contents,
      summary,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('shelf_entries')
      .upsert(payload, { onConflict: 'shelf_id' });

    if (error) {
      console.error('Failed to save shelf entry to Supabase', error);
    }
  };

  const scheduleShelfSave = (shelf) => {
    const timeouts = saveTimeoutsRef.current;
    if (timeouts.has(shelf.id)) {
      clearTimeout(timeouts.get(shelf.id));
    }
    const timeoutId = setTimeout(() => {
      persistShelfToSupabase(shelf);
      timeouts.delete(shelf.id);
    }, 600);
    timeouts.set(shelf.id, timeoutId);
  };

  const limitToTwoSentences = (value) => {
    const sentences = value
      .match(/[^.!?]+[.!?]*/g)
      ?.map((segment) => segment.trim())
      .filter((segment) => segment.length > 0) ?? [];
    return sentences.slice(0, 2).join(' ');
  };

  const handleEntryDraftChange = (field, nextValue) => {
    const nextEntryValue =
      field === 'description' ? limitToTwoSentences(nextValue) : nextValue;
    setEntryDraft((prev) => ({
      ...prev,
      [field]: nextEntryValue
    }));
  };

  const handleSaveEntry = async () => {
    const summary = buildSummary(entryDraft);
    const currentShelf = shelves.find((item) => item.id === selectedId);
    const baseContents = currentShelf?.contents ?? [];
    const nextContents = [...baseContents];
    const emptyIndex = nextContents.findIndex(
      (item) => item.trim().length === 0
    );
    if (summary) {
      if (emptyIndex >= 0) {
        nextContents[emptyIndex] = summary;
      } else if (nextContents.length > 0) {
        nextContents[nextContents.length - 1] = summary;
      }
    }
    setShelves((prev) =>
      prev.map((shelf) => {
        if (shelf.id !== selectedId) {
          return shelf;
        }

        return {
          ...shelf,
          entry: {
            ...shelf.entry,
            ...entryDraft
          },
          contents: nextContents.length ? nextContents : shelf.contents
        };
      })
    );
    if (currentShelf) {
      await persistShelfToSupabase(
        {
          ...currentShelf,
          entry: {
            ...currentShelf.entry,
            ...entryDraft
          },
          contents: nextContents.length ? nextContents : currentShelf.contents
        },
        summary
      );
    }
    setIsEntryOpen(false);
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
              <PositionDetail
                shelf={selectedShelf}
                onNameChange={handleShelfNameChange}
                onItemChange={handleShelfItemChange}
                onAddEntry={handleAddEntry}
              />
            )}
          </div>
        </section>

        <DispatchWarnings warnings={warnings} />

        <Footer timestamp={timestamp} />
      </main>
      {isEntryOpen && (
        <div className="entry-modal">
          <div className="entry-card">
            <div className="entry-header">
              <div>
                <p className="eyebrow">Shelf entry</p>
                <h3>{selectedShelf?.label}</h3>
              </div>
              <button
                type="button"
                className="entry-close"
                onClick={() => setIsEntryOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="entry-grid">
              {entryFields.map((field) => (
                <label key={field.key} className="entry-field">
                  <span className="entry-label">{field.label}</span>
                  {field.multiline ? (
                    <textarea
                      className="entry-input entry-textarea"
                      rows={2}
                      value={entryDraft[field.key]}
                      onChange={(event) =>
                        handleEntryDraftChange(field.key, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      className="entry-input"
                      type={field.type}
                      value={entryDraft[field.key]}
                      onChange={(event) =>
                        handleEntryDraftChange(field.key, event.target.value)
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="entry-actions">
              <button
                type="button"
                className="entry-button secondary"
                onClick={() => setIsEntryOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="entry-button"
                onClick={handleSaveEntry}
              >
                Save entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
