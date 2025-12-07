import { Header } from './Header';

/**
 * Layout Component
 *
 * Main layout wrapper for authenticated pages
 */
interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
};
