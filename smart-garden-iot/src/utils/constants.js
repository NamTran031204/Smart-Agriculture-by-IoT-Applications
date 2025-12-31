// Mock data for demo when API is not available
export const MOCK_PLANTS = [
  {
    id: 1,
    name: 'Cây Trầu Bà',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop',
    waterDays: 2,
    temperature: 24,
    humidity: 65,
    sunlight: '10 giờ/ngày',
    lastWatered: '2 giờ trước',
    soilMoisture: 45
  },
  {
    id: 2,
    name: 'Cây Monstera',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=300&fit=crop',
    waterDays: 4,
    temperature: 26,
    humidity: 70,
    sunlight: '8 giờ/ngày',
    lastWatered: '1 ngày trước',
    soilMoisture: 55
  },
  {
    id: 3,
    name: 'Xương Rồng Mini',
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400&h=300&fit=crop',
    waterDays: 2,
    temperature: 32,
    humidity: 45,
    sunlight: '10 giờ/ngày',
    lastWatered: '5 giờ trước',
    soilMoisture: 35
  },
  {
    id: 4,
    name: 'Cây Sung',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=300&fit=crop',
    waterDays: 1,
    temperature: 28,
    humidity: 68,
    sunlight: '6 giờ/ngày',
    lastWatered: '30 phút trước',
    soilMoisture: 75
  },
  {
    id: 5,
    name: 'Cây Lưỡi Hổ',
    image: 'https://images.unsplash.com/photo-1593482892290-b2a4a6b3d5b9?w=400&h=300&fit=crop',
    waterDays: 6,
    temperature: 25,
    humidity: 55,
    sunlight: '4 giờ/ngày',
    lastWatered: '3 ngày trước',
    soilMoisture: 40
  },
  {
    id: 6,
    name: 'Hoa Ý Lan',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop',
    waterDays: 3,
    temperature: 24,
    humidity: 73,
    sunlight: '5 giờ/ngày',
    lastWatered: '1 ngày trước',
    soilMoisture: 60
  },
  {
    id: 7,
    name: 'Cây Cao Su',
    image: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=300&fit=crop',
    waterDays: 5,
    temperature: 26,
    humidity: 62,
    sunlight: '7 giờ/ngày',
    lastWatered: '2 ngày trước',
    soilMoisture: 50
  },
  {
    id: 8,
    name: 'Cây Trường Sinh',
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400&h=300&fit=crop',
    waterDays: 1,
    temperature: 27,
    humidity: 58,
    sunlight: '9 giờ/ngày',
    lastWatered: '8 giờ trước',
    soilMoisture: 65
  }
];

export const MOCK_SENSOR_DATA = {
  temperature: 26,
  humidity: 65,
  soilMoisture: 45,
  light: 450,
  timestamp: new Date().toISOString()
};

export const DEFAULT_THRESHOLDS = {
  soilMoistureMin: 30,
  temperatureMax: 35,
  lightMin: 300
};

export const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const AUTO_REFRESH_INTERVAL = 5000; // 5 seconds

// ========== LocalStorage Keys ==========
// Backend không có API cho settings và plants, nên lưu vào localStorage
export const STORAGE_KEYS = {
  THRESHOLDS: 'garden_thresholds',
  PLANTS: 'garden_plants',
  AUTO_REFRESH: 'garden_auto_refresh'
};

// ========== LocalStorage Helpers ==========

// Lấy thresholds từ localStorage
export const getStoredThresholds = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
    return stored ? JSON.parse(stored) : DEFAULT_THRESHOLDS;
  } catch (error) {
    console.error('Error reading thresholds from localStorage:', error);
    return DEFAULT_THRESHOLDS;
  }
};

// Lưu thresholds vào localStorage
export const saveThresholds = (thresholds) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholds));
    return true;
  } catch (error) {
    console.error('Error saving thresholds to localStorage:', error);
    return false;
  }
};

// Lấy plants từ localStorage
export const getStoredPlants = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLANTS);
    return stored ? JSON.parse(stored) : MOCK_PLANTS;
  } catch (error) {
    console.error('Error reading plants from localStorage:', error);
    return MOCK_PLANTS;
  }
};

// Lưu plants vào localStorage
export const savePlants = (plants) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(plants));
    return true;
  } catch (error) {
    console.error('Error saving plants to localStorage:', error);
    return false;
  }
};

// Lấy auto refresh setting
export const getAutoRefreshSetting = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUTO_REFRESH);
    return stored === null ? true : stored === 'true';
  } catch (error) {
    console.error('Error reading auto refresh setting:', error);
    return true;
  }
};

// Lưu auto refresh setting
export const saveAutoRefreshSetting = (enabled) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_REFRESH, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error saving auto refresh setting:', error);
    return false;
  }
};