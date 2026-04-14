import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Loyalty from './pages/Loyalty';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

// Mocked Login View if not logged in
function AuthCheck({ children }) {
  const { user } = useAuth();
  
  if (user === null) {
      return <Auth />;
  }
  
  return children;
}

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Auto Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div 
        className="min-h-screen relative transition-colors duration-300 pb-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: isDarkMode ? "linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/bg.png')" : "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url('/bg.png')" }}
      >
        
        {/* Header Minimalista y Centrado */}
        <header className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center shadow-sm relative">
          
          {/* Espaciador vacío a la izquierda para balance visual si fuese necesario */}
          <div className="w-10"></div>

          {/* Logo Minimalista Centrado Absoluto */}
          <h1 className="text-lg font-black uppercase text-white absolute left-1/2 -translate-x-1/2 tracking-wider drop-shadow-md">
            Modern <span className="text-[#eab308] italic">Barber</span>
          </h1>
          
          {/* Botón modo oscuro a la derecha */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-black dark:text-white relative z-10"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </header>

        {/* RUTAS */}
        <div className="max-w-5xl mx-auto w-full relative z-10 pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/booking" element={<AuthCheck><Booking /></AuthCheck>} />
            <Route path="/loyalty" element={<AuthCheck><Loyalty /></AuthCheck>} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>

        {/* Navigation Bottom Tab siempre visible para navegar al catálogo */}
        <Navigation />

        {/* Floating Action Button - WhatsApp */}
        <a 
          href="https://wa.me/34600123456?text=Hola,%20quisiera%20reservar."
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/30 hover:scale-110 transition-transform z-40 text-2xl"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-8 h-8 filter brightness-0 invert" />
        </a>
          
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
