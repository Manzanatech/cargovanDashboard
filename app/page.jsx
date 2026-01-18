'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [timestamp, setTimestamp] = useState('just now');

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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">CV</div>
          <div>
            <p className="eyebrow">CargoVan</p>
            <h1>Load Console</h1>
          </div>
        </div>
        <nav className="nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Load plan</button>
          <button className="nav-item">Trades</button>
          <button className="nav-item">Inventory</button>
          <button className="nav-item">Reports</button>
        </nav>
        <div className="status-card">
          <p className="label">Van readiness</p>
          <p className="stat">92%</p>
          <p className="meta">Fully stocked for today</p>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Warehouse 03 · West Hub</p>
            <h2>Route 7A · Morning trades</h2>
          </div>
          <div className="actions">
            <button className="ghost">View map</button>
            <button className="primary">Lock load</button>
          </div>
        </header>

        <section className="summary">
          <div className="summary-card">
            <p className="label">Load capacity</p>
            <p className="stat">78%</p>
            <p className="meta">2 shelves remaining</p>
          </div>
          <div className="summary-card">
            <p className="label">Active trades</p>
            <p className="stat">5</p>
            <p className="meta">Electrical · HVAC · Plumbing</p>
          </div>
          <div className="summary-card">
            <p className="label">Toolkits</p>
            <p className="stat">34</p>
            <p className="meta">8 require calibration</p>
          </div>
          <div className="summary-card">
            <p className="label">Stops</p>
            <p className="stat">12</p>
            <p className="meta">First ETA 08:45</p>
          </div>
        </section>

        <section className="content">
          <article className="panel van-panel">
            <header>
              <div>
                <h3>Cargo van shelves</h3>
                <p className="meta">Tap a shelf to view assigned trade kits.</p>
              </div>
              <button className="ghost">Switch view</button>
            </header>
            <div className="van-layout">
              <div className="plan-stage">
                <div className="stage-header">
                  <div>
                    <p className="eyebrow">Load plan</p>
                    <h3>Route 7A cargo layout</h3>
                  </div>
                  <div className="stage-actions">
                    <button className="ghost small">Views</button>
                    <button className="ghost small">Annotate</button>
                  </div>
                </div>
                <div className="stage-placeholder">
                  <div>
                    <p className="title">Cargo van image space</p>
                    <p className="meta">Drop in your van illustration or photo here.</p>
                  </div>
                </div>
                <div className="stage-legend">
                  <span className="chip success">Ready</span>
                  <span className="chip warning">Checks</span>
                  <span className="chip neutral">Open</span>
                </div>
              </div>
              <div className="plan-aside">
                <div className="van">
                  <div className="van-header">
                    <span>Bulkhead</span>
                    <span>Rear</span>
                  </div>
                  <div className="shelf-grid">
                    <button className="shelf assigned">
                      <p>Upper A</p>
                      <span>Electrical</span>
                    </button>
                    <button className="shelf assigned">
                      <p>Upper B</p>
                      <span>Plumbing</span>
                    </button>
                    <button className="shelf assigned">
                      <p>Upper C</p>
                      <span>HVAC</span>
                    </button>
                    <button className="shelf assigned">
                      <p>Mid A</p>
                      <span>Finish</span>
                    </button>
                    <button className="shelf assigned">
                      <p>Mid B</p>
                      <span>Drywall</span>
                    </button>
                    <button className="shelf empty">
                      <p>Mid C</p>
                      <span>Open</span>
                    </button>
                    <button className="shelf assigned">
                      <p>Lower A</p>
                      <span>Power tools</span>
                    </button>
                    <button className="shelf assigned">
                      <p>Lower B</p>
                      <span>Safety</span>
                    </button>
                    <button className="shelf empty">
                      <p>Lower C</p>
                      <span>Open</span>
                    </button>
                  </div>
                  <div className="floor">
                    <div>
                      <p className="label">Floor bays</p>
                      <p className="meta">Generator · Pipe bender · Lift dolly</p>
                    </div>
                    <span className="chip warning">Secure</span>
                  </div>
                </div>
                <div className="trade-tools">
                  <h4>Tools by trade</h4>
                  <div className="trade-card">
                    <div>
                      <p className="title">Electrical</p>
                      <p className="meta">Conduit kit, multimeters, fish tape</p>
                    </div>
                    <span className="chip success">Ready</span>
                  </div>
                  <div className="trade-card">
                    <div>
                      <p className="title">Plumbing</p>
                      <p className="meta">PEX expander, press tool, cutters</p>
                    </div>
                    <span className="chip success">Ready</span>
                  </div>
                  <div className="trade-card">
                    <div>
                      <p className="title">HVAC</p>
                      <p className="meta">Gauge set, vacuum pump, refrigerant</p>
                    </div>
                    <span className="chip warning">2 checks</span>
                  </div>
                  <div className="trade-card">
                    <div>
                      <p className="title">Finish</p>
                      <p className="meta">Laser level, fasteners, trim saw</p>
                    </div>
                    <span className="chip neutral">Partial</span>
                  </div>
                  <div className="trade-card">
                    <div>
                      <p className="title">Drywall</p>
                      <p className="meta">Taping kit, screw guns, stilts</p>
                    </div>
                    <span className="chip success">Ready</span>
                  </div>
                  <div className="trade-card highlight">
                    <div>
                      <p className="title">Shared safety</p>
                      <p className="meta">PPE, harnesses, first aid, signage</p>
                    </div>
                    <button className="primary small">Reassign</button>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="panel right-panel">
            <header>
              <h3>Checks &amp; alerts</h3>
              <button className="ghost">Review</button>
            </header>
            <div className="alert">
              <p className="title">Calibration due</p>
              <p className="meta">8 multimeters require calibration today.</p>
              <span className="chip warning">Medium</span>
            </div>
            <div className="alert">
              <p className="title">Missing consumables</p>
              <p className="meta">Drywall screws below threshold.</p>
              <span className="chip danger">High</span>
            </div>
            <div className="alert">
              <p className="title">Fuel check</p>
              <p className="meta">Generator fuel at 64%.</p>
              <span className="chip neutral">Low</span>
            </div>
            <div className="cta-card">
              <p className="title">Next action</p>
              <p className="meta">Assign Mid C shelf to electrical overflow kit.</p>
              <button className="primary">Assign shelf</button>
            </div>
          </aside>
        </section>

        <footer>
          <p>Last synced <span>{timestamp}</span></p>
        </footer>
      </div>
    </div>
  );
}
