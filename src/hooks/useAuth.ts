import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Custom hook for authentication
 *
 * Provides access to authentication state and methods.
 * This is a convenience wrapper around useAuthContext.
 */
export const useAuth = () => {
  const context = useAuthContext();
  return context;
};
