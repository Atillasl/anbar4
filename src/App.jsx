import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// KOMPONENTLƏR
import Header from './Components/Header';
import ErrorBoundary from './Components/ErrorBoundary';
import ProtectedRoute from './ProtectedRoute';

// SƏHİFƏLƏR
import Login from './pages/Login';
import Dashboard from './pages/Dashboard.jsx'; // Nəzarət Mərkəzi
import Warehouses from './pages/Warehouses'; // Anbarların siyahısı (Yeni)
import WarehouseDetail from './pages/WarehouseDetail'; // Anbarın daxili (Mallar)
import Projects from './pages/Projects'; // Layihə siyahısı
import ProjectDetail from './pages/ProjectDetail'; // Layihə idarəetmə və smeta
import Statistics from './pages/Statistics';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans selection:bg-indigo-500 selection:text-white">
          
          {/* Giriş edilibsə Naviqasiya Menyu görünsün */}
          {isAuthenticated && <Header onLogout={handleLogout} />}

          <main className="animate-in fade-in duration-700">
          <Routes>
            {/* LOGIN & AUTH */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} 
            />
            
            {/* ANA SƏHİFƏ (DASHBOARD) */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* ANBAR MODULU */}
            <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
            <Route path="/warehouse/:id" element={<ProtectedRoute><WarehouseDetail /></ProtectedRoute>} />
            
            {/* LAYİHƏ MODULU */}
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            
            {/* ANALİTİKA VƏ HESABATLAR */}
            <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
            
            {/* 404 YÖNLƏNDİRMƏSİ */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
    </ErrorBoundary>
  );
};

export default App;