import './globals.css';

export const metadata = {
  title: 'MY PREMIER Admin',
  description: 'Admin Panel MY PREMIER',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
