// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Kiểm tra xem có lưu user trong localStorage không (để F5 không bị mất login)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (username, password) => {
    // --- MOCK DATA LOGIC ---
    if (username === 'admin' && password === '123') {
      const adminUser = { 
        id: 1, 
        username: 'admin', 
        fullName: 'Quản Trị Viên', 
        role: 'ADMIN',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=10B981&color=fff'
      };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return { success: true };
    }
    
    if (username === 'user' && password === '456') {
      const normalUser = { 
        id: 2, 
        username: 'user', 
        fullName: 'Khách Hàng', 
        role: 'USER',
        avatar: 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff' 
      };
      setUser(normalUser);
      localStorage.setItem('currentUser', JSON.stringify(normalUser));
      return { success: true };
    }

    return { success: false, message: 'Tài khoản hoặc mật khẩu không đúng!' };
  };

  const register = (username, password, fullName) => {
    // Mock Register: Luôn báo thành công (chưa lưu thật)
    return { success: true, message: 'Đăng ký thành công! Hãy đăng nhập.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);