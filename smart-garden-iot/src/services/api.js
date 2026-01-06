// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const GATEWAY_ID = 'esp32-01';

// 1. Tạo instance axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. THÊM ĐOẠN NÀY: Interceptor để tự động gắn Token vào mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Gắn vào Header theo chuẩn Bearer
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Các hàm gọi API (Giữ nguyên logic cũ của bạn)
export const sensorAPI = {
  getLatest: async () => {
    const response = await apiClient.get('/sensors/latest');
    return response.data;
  },

  getHistory: async (startTime, endTime) => {
    const response = await apiClient.get('/sensors/history', {
      params: { from: startTime, to: endTime }
    });
    return response.data;
  }
};

export const deviceAPI = {
  getAllDevices: async () => {
    const response = await apiClient.get('/devices');
    return response.data;
  },

  controlDevice: async (virtualComponentId, state) => {
    let realHardwareId = 'pump'; 

    const idLower = virtualComponentId.toLowerCase();
    
    if (idLower.includes('fan') || idLower.includes('quat')) {
        realHardwareId = 'fan';
    } 
    else if (idLower.includes('light') || idLower.includes('den') || idLower.includes('led')) {
        realHardwareId = 'light';
    }

    console.log(`Sending to Backend: /control/${realHardwareId} | State: ${state}`);

    return apiClient.post(`/control/${GATEWAY_ID}/${realHardwareId}`, {
      state: state
    });
  }
};