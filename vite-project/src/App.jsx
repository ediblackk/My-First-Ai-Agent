import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useAuth } from './WalletProviderWrapper';
import Header from './Header';
import Footer from './Footer';
import MainComponent from './MainComponent';
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './ErrorBoundary';
import './app.css';

// Componenta pentru protejarea rutelor admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    console.log('Access denied: Not authenticated');
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    console.log('Access denied: Not admin');
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<MainComponent />} />
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;
