import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './App.css';

/**
 * Create router instance with generated route tree
 */
const router = createRouter({ routeTree });

/**
 * Type-safe router instance declaration
 */
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

/**
 * Main App Component
 *
 * Sets up TanStack Router with the RouterProvider
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
