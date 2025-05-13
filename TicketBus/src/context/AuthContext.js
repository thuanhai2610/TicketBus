// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async (token) => {
    try {
      const decoded = jwtDecode(token);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({
        username: decoded.username || '',
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        avatar: res.data.avatar?.startsWith('http')
          ? res.data.avatar
          : `${import.meta.env.VITE_API_URL}${res.data.avatar}`,
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchUser(token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
