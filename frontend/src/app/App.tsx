// src/app/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

// Importe tes pages existantes
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ProduitsPage } from './pages/Produits/ProduitsPage';
import { Marketing } from './pages/Marketing';
import { Parametres } from './pages/Parametres';

// Layout avec Header et Sidebar
import Header from './components/Header';
import { Sidebar } from './components/Sidebar';

// Layout pour les pages protégées
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar fixe à gauche */}
      <Sidebar />
      
      {/* Conteneur principal avec marge à gauche pour la sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header fixe en haut */}
        <Header />
        
        {/* Contenu principal avec scroll */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Route publique - Login */}
            <Route path="/login" element={<Login />} />

            {/* Routes protégées avec Layout */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/clients"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Clients />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/produits"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <ProduitsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/marketing"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Marketing />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            <Route
              path="/parametres"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Parametres />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Page 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      {/* Toaster pour les notifications (sonner) */}
      <Toaster position="top-right" richColors />

      {/* React Query Devtools (uniquement en dev) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;