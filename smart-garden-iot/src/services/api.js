import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Có thể thêm token vào đây nếu cần
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ========== SENSOR APIs (UC01) ==========
export const sensorAPI = {
  // GET /api/sensors/latest
  getLatest: async () => {
    try {
      const response = await apiClient.get('/sensors/latest');
      // MAPPING DỮ LIỆU: Backend -> Frontend
      return {
        temperature: response.temp,      // temp -> temperature
        humidity: response.humid,        // humid -> humidity
        soilMoisture: response.moisture, // moisture -> soilMoisture
        light: response.optical,         // optical -> light (Backend trả về optical)
        timestamp: response.timestamp
      };
    } catch (error) {
      throw error;
    }
  },
  
  // GET /api/sensors/history?from=timestamp&to=timestamp
  getHistory: (from, to) => 
    apiClient.get('/sensors/history', { params: { from, to } }),
};

// ========== DEVICE APIs ==========
export const deviceAPI = {
  // GET /api/devices - Lấy tất cả thiết bị và trạng thái
  getAllDevices: () => apiClient.get('/devices'),
  
  // POST /api/control/{deviceId} - Điều khiển thiết bị
  // deviceId: "pump", "fan", "light"
  // state: "ON" hoặc "OFF"
  controlDevice: (deviceId, state) => 
    apiClient.post(`/control/${deviceId}`, { state }),
};

// ========== HELPER FUNCTIONS cho Frontend ==========
// Các hàm này để frontend dễ sử dụng hơn

// Lấy trạng thái thiết bị dưới dạng object {pump: true/false, fan: true/false, light: true/false}
export const getDeviceStatus = async () => {
  try {
    const devices = await deviceAPI.getAllDevices();
    
    // Convert array of devices to object format cho frontend
    const status = {
      pump: false,
      fan: false,
      light: false
    };
    
    devices.forEach(device => {
      const deviceId = device.deviceId || device.name?.toLowerCase();
      const isOn = device.state === 'ON' || device.status === 'ON';
      
      if (deviceId === 'pump' || deviceId === 'bom') {
        status.pump = isOn;
      } else if (deviceId === 'fan' || deviceId === 'quat') {
        status.fan = isOn;
      } else if (deviceId === 'light' || deviceId === 'den') {
        status.light = isOn;
      }
    });
    
    return status;
  } catch (error) {
    console.error('Error getting device status:', error);
    throw error;
  }
};

// Điều khiển máy bơm
export const controlPump = (turnOn) => 
  deviceAPI.controlDevice('pump', turnOn ? 'ON' : 'OFF');

// Điều khiển quạt
export const controlFan = (turnOn) => 
  deviceAPI.controlDevice('fan', turnOn ? 'ON' : 'OFF');

// Điều khiển đèn
export const controlLight = (turnOn) => 
  deviceAPI.controlDevice('light', turnOn ? 'ON' : 'OFF');

// ========== LƯU Ý ==========
// Backend KHÔNG có các API sau, frontend sẽ dùng mock data:
// - /api/settings/thresholds (GET/PUT)
// - /api/plants (GET/POST/PUT/DELETE)
// 
// Nếu cần, có thể lưu settings và plants vào localStorage
// hoặc yêu cầu Backend team thêm API này

export default apiClient;