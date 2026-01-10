'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  user: null,
  loading: true,
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Set user to a truthy value if token exists (for compatibility with existing code)
    // The actual user object is not needed since we're not using Firebase auth
    setUser(token ? { token } : null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

