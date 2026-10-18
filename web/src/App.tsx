import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { LoginPage } from './pages/LoginPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ContactsPage } from './pages/ContactsPage';
import { BroadcastPage } from './pages/BroadcastPage';

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-unni-main text-slate-100 flex-col md:flex-row">
      <Navbar />
      <main className="flex flex-1 flex-col overflow-y-auto bg-unni-main min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/broadcast" element={<BroadcastPage />} />
            <Route path="/" element={<Navigate to="/connections" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/connections" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
