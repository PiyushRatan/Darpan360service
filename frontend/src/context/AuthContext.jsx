import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { secureFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null); // The MongoDB User representation (role, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase listener for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Sync with our MongoDB Backend. If it's a new user, the backend will auto-create the document.
          // This ensures our backend knows their Firebase UID and role.
          const dbResponse = await secureFetch('/auth/sync', { method: 'POST' });
          setDbUser(dbResponse);
        } catch (error) {
          console.error("Failed to sync user with Backend Database:", error);
        }
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, dbUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
