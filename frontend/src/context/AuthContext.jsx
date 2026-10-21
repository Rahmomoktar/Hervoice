import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  return <AuthContext.Provider value={{
    user,
    token,
    setUser,
    setToken
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required');
  return context;
}
