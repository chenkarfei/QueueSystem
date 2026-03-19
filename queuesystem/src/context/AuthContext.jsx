import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('qms_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('qms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('qms_user');
    }
  }, [user]);

  const login = (role, pin, counterId = null) => {
    if (role === 'admin' && pin === '1234') {
      setUser({ role: 'admin', name: 'Admin User' });
      return true;
    }
    if (role === 'counter' && pin === '5678' && counterId) {
      setUser({ role: 'counter', name: `Staff for ${counterId}`, counterId: counterId });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
