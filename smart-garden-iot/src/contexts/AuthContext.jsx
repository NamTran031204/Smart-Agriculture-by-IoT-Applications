import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
        const res = await axios.post('http://localhost:8080/api/users/login', { username, password });
        
        const token = res.data; 

        const decoded = jwtDecode(token); 

        const userData = {
            username: decoded.sub,
            role: decoded.role,
            fullName: username,
            token: token
        };

        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('token', token);

        return { success: true };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: 'Sai tài khoản hoặc mật khẩu!' };
    }
  };

  const register = async (username, password, fullName, email) => {
    try {
      await axios.post('http://localhost:8080/api/users/register', {
        username: username,
        password: password,
        fullName: fullName,
        email: email || "",
        role: "USER"
      });
      
      return { success: true, message: 'Đăng ký thành công! Hãy đăng nhập.' };
    } catch (error) {
      console.error("Register Error:", error);
      const msg = error.response?.data?.message || 'Đăng ký thất bại (Trùng username?)';
      return { success: false, message: msg };
    }
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