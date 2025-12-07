import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';

/**
 * Header Component
 *
 * Main navigation header with user menu
 */
export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-primary">
          Migraine Log
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="hover:text-primary transition-colors"
            activeProps={{ className: 'text-primary font-medium' }}
          >
            Dashboard
          </Link>
          <Link
            to="/episodes"
            className="hover:text-primary transition-colors"
            activeProps={{ className: 'text-primary font-medium' }}
          >
            Episodes
          </Link>
          <Link
            to="/analysis"
            className="hover:text-primary transition-colors"
            activeProps={{ className: 'text-primary font-medium' }}
          >
            Analysis
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-destructive hover:text-destructive/80 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
