export default function Footer({ timestamp }) {
  return (
    <footer className="footer">
      <p>
        Last synced <span>{timestamp}</span>
      </p>
    </footer>
  );
}