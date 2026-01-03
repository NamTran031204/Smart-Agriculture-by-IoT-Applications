import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Bỏ dòng DEFAULT_GATEWAY_ID hoặc để đó không dùng cũng được
// const DEFAULT_GATEWAY_ID = 'esp32-01'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sensorAPI = {
  getLatest: async () => {
    const response = await apiClient.get('/sensors/latest');
    return response.data;
  },

  // --- THÊM HÀM NÀY ĐỂ VẼ BIỂU ĐỒ ---
  getHistory: async (startTime, endTime) => {
    // Backend yêu cầu tham số 'from' và 'to' (Unix timestamp tính bằng giây hoặc milisecond tùy data của bạn)
    // Code Java của bạn đang lưu timestamp dạng giây (System.currentTimeMillis() / 1000)
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

  // --- PHẦN CẦN SỬA Ở ĐÂY ---
  controlDevice: async (virtualComponentId, state) => {
    // 1. Ánh xạ ID ảo (pump_1, pump_2) -> ID thật (pump)
    let realHardwareId = 'pump'; // Mặc định

    const idLower = virtualComponentId.toLowerCase();
    
    // Logic map ID ảo về ID thật của ESP32
    if (idLower.includes('fan') || idLower.includes('quat')) {
        realHardwareId = 'fan';
    } 
    else if (idLower.includes('light') || idLower.includes('den') || idLower.includes('led')) {
        realHardwareId = 'light';
    }
    // Còn lại nếu có chữ 'pump', 'bom' hoặc không khớp gì thì giữ mặc định là 'pump'

    console.log(`Sending to Backend: /control/${realHardwareId} | State: ${state}`);

    // 2. GỌI API THEO ĐÚNG CẤU TRÚC BACKEND HIỆN TẠI
    // Backend của bạn: @PostMapping("/control/{deviceId}")
    // Nên URL chỉ là: /control/pump (không có esp32-01 nữa)
    return apiClient.post(`/control/${realHardwareId}`, {
      state: state
    });
  }
};

