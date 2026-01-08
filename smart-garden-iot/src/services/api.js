import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const GATEWAY_ID = 'esp32-01';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const sensorAPI = {
  getLatest: async () => {
    const response = await apiClient.get('/sensors/latest');
    return response.data;
  },

  getHistory: async (startTime, endTime) => {
    const response = await apiClient.post(`/sensors/history`, {
        from: startTime,
        to: endTime,
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