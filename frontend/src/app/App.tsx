// src/app/App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';

// Pages existantes
import { Dashboard } from './pages/Dashboard';
import { ProduitsPage } from './pages/Produits/ProduitsPage';
import { Marketing } from './pages/Marketing';
import { Parametres } from './pages/Parametres';

// Modules importés
import { VentesPage } from './pages/Ventes/VentesPage';
import { ClientsPage } from './pages/Clients/ClientsPage';
import { GestionPrestations } from './pages/prestations/GestionPrestations';

// Module Rendez-vous
import { RendezVousPage } from './pages/RendezVous/RendezVousPage';
import { VuePubliqueRendezVous } from './pages/RendezVous/VuePubliqueRendezVous';

// Module Pointages
import { PointagesPage } from './pages/Pointages/PointagesPage';

// Module Dépenses
import DepensesPage from './pages/Depenses';

// Module Confections
import ConfectionsPage from './pages/Confections/ConfectionPage';

// Module Rapports
import RapportsPage from './pages/Rapports/RapportsPage';

// Layout avec Header et Sidebar
import Header from './components/Header';
import { Sidebar } from './components/Sidebar';

import { VuePubliqueMain } from './pages/public/VuePubliqueMain';
import { ServicesPage } from './pages/public/ServicesPage';
import { ProduitsPagePublic } from './pages/public/ProduitsPagePublic';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
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
          <NotificationProvider>
            <Routes>
              {/* Page d'accueil publique - Vue principale */}
              {/* Route d'accueil - Vue publique par défaut */}
              <Route path="/" element={<VuePubliqueMain><Navigate to="/services" replace /></VuePubliqueMain>} />
              <Route path="/services" element={<VuePubliqueMain><ServicesPage /></VuePubliqueMain>} />
              <Route path="/publicproduits" element={<VuePubliqueMain><ProduitsPagePublic /></VuePubliqueMain>} />
              <Route path="/rendez-vous" element={<VuePubliqueMain><VuePubliqueRendezVous /></VuePubliqueMain>} />

              
              {/* Routes publiques */}
              <Route path="/login" element={<Login />} />
              <Route path="/prendre-rendez-vous" element={<VuePubliqueRendezVous />} />

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
                      <ClientsPage />
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
                path="/confections"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <ConfectionsPage />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/prestations"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <GestionPrestations />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/ventes"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <VentesPage />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/rendez-vous"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <RendezVousPage />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/pointages"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <PointagesPage />
                    </MainLayout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/depenses"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <DepensesPage />
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
                path="/rapports"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <RapportsPage />
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

              {/* Redirection pour les routes inconnues */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>

      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;