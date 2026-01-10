import './globals.css';
import { AuthProviderWrapper } from '../components/AuthProviderWrapper';

export const metadata = {
  title: 'MY PREMIER Admin',
  description: 'Admin Panel MY PREMIER',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
