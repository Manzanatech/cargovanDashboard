import './global.css';

export const metadata = {
  title: 'CargoVan Dashboard',
  description: 'Operations dashboard for cargo van shelf planning and trade kits.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}