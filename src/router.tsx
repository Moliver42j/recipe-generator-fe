import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ConfigurationPage from './pages/ConfigurationPage';
import FavouritesPage from './pages/FavouritesPage';
import ExportPage from './pages/ExportPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

const router = createBrowserRouter([
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'configuration', element: <ConfigurationPage /> },
      { path: 'favourites', element: <FavouritesPage /> },
      { path: 'export', element: <ExportPage /> },
    ],
  },
]);

export default router;
