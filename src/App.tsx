import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import BooksPage from './pages/BooksPage';
import DashboardPage from './pages/DashboardPage';
import AuthorsPage from './pages/AuthorsPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';
import AdminRoute from './routes/AdminRoute';
import LoansPage from './pages/LoansPage';
import ReturnsPage from './pages/ReturnsPage';
import ReservationsPage from './pages/ReservationsPage';
import DesignSystemPage from './pages/DesignSystemPage';

const ReportsPage = lazy(() => import('./pages/ReportsPage'));

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/livros" element={<BooksPage />} />
          <Route path="/autores" element={<AuthorsPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/emprestimos" element={<LoansPage />} />
          <Route path="/devolucoes" element={<ReturnsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/reservas" element={<ReservationsPage />} />
            <Route path="/relatorios" element={<Suspense fallback={<p className="route-loading">Carregando relatórios...</p>}><ReportsPage /></Suspense>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
