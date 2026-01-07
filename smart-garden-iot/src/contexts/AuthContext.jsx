// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Kiểm tra xem có lưu user trong localStorage không (để F5 không bị mất login)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
        // 1. Gọi API
        const res = await axios.post('http://localhost:8080/api/users/login', { username, password });
        
        // 2. Backend trả về token (dạng String)
        const token = res.data; 

        // 3. Giải mã token để lấy role và username
        // Nếu không cài jwt-decode, token có 3 phần, phần giữa là payload base64
        const decoded = jwtDecode(token); 
        // decoded sẽ có dạng: { sub: "username", role: "ADMIN", exp: ... }

        const userData = {
            username: decoded.sub, // hoặc decoded.username tùy backend config
            role: decoded.role,    // Backend Java của bạn lưu key là "role"
            fullName: username,    // Backend API login hiện tại chưa trả về fullName, tạm lấy username
            token: token           // Lưu token để dùng cho các request sau
        };

        // 4. Lưu vào State và LocalStorage
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('token', token); // Lưu riêng token để tiện gắn vào Header

        return { success: true };

    } catch (error) {
        console.error("Login Error:", error);
        return { success: false, message: 'Sai tài khoản hoặc mật khẩu!' };
    }
  };

  const register = async (username, password, fullName, email) => {
    try {
      // Gọi API xuống Backend để tạo user thật
      await axios.post('http://localhost:8080/api/users/register', {
        username: username,
        password: password,
        fullName: fullName,
        email: email || "", // Email có thể để trống nếu form không có
        role: "USER"        // Mặc định là USER thường
      });
      
      return { success: true, message: 'Đăng ký thành công! Hãy đăng nhập.' };
    } catch (error) {
      console.error("Register Error:", error);
      // Lấy thông báo lỗi từ Backend nếu có
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