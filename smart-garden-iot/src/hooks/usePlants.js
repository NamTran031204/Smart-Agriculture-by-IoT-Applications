import { useState, useEffect } from 'react';
// XÓA dòng import plantsAPI bên dưới vì api.js không còn export nó nữa
// import { plantsAPI } from '../services/api'; 

// THÊM: Import hàm lấy dữ liệu từ LocalStorage/Mock
import { getStoredPlants } from '../utils/constants';

export const usePlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vì Backend chưa có API plants, ta giả lập việc gọi API bằng setTimeout
      // và lấy dữ liệu từ LocalStorage hoặc Mock Data
      await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập trễ 0.5s
      
      const data = getStoredPlants();
      setPlants(data);
      
    } catch (err) {
      console.error('Error fetching plants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return { 
    plants, 
    loading, 
    error, 
    refetch: fetchPlants 
  };
};