import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getUserData } from '../firebase/db';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
         const dbUser = await getUserData(currentUser.uid);
         setUser(dbUser ? { ...currentUser, ...dbUser } : currentUser);
      } else {
         setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    setUser // Usado solo para fallbacks si hiciera falta.
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
