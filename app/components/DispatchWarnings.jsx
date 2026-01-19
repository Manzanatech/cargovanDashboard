const severityLabels = {
  high: 'BLOCKING',
  medium: 'REVIEW',
  low: 'ADVISORY'
};

export default function DispatchWarnings({ warnings }) {
  return (
    <section className="warnings-panel">
      <header className="warnings-header">
        <p className="eyebrow">Dispatch checks</p>
        <h3>Blocking issues</h3>
      </header>
      <div className="warning-list">
        {warnings.map((warning) => (
          <article key={warning.id} className={`warning-row ${warning.severity}`}>
            <span className="warning-bar" aria-hidden="true" />
            <div className="warning-body">
              <span className={`warning-label ${warning.severity}`}>
                {severityLabels[warning.severity]}
              </span>
              <p className="detail-title">{warning.title}</p>
              <p className="meta">{warning.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}