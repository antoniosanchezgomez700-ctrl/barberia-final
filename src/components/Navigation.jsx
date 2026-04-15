import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiAward, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === '/admin') return null;
  
  const navItems = [
    { name: 'Inicio', path: '/', icon: <FiHome className="text-2xl" /> },
    { name: 'Fidelidad', path: '/loyalty', icon: <FiAward className="text-2xl" /> },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: <FiSettings className="text-2xl" /> });
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full glass z-50 px-6 py-3 pb-safe border-t border-gray-200 dark:border-gray-800">
      <ul className="flex justify-between items-center max-w-lg mx-auto w-full">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink 
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
