import { useState, useEffect } from 'react';
import { deviceAPI, getDeviceStatus, controlPump, controlFan, controlLight } from '../services/api';

export const useDeviceControl = () => {
  const [deviceStatus, setDeviceStatus] = useState({
    pump: false,
    fan: false,
    light: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy trạng thái thiết bị từ backend
  const fetchDeviceStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await getDeviceStatus();
      setDeviceStatus(status);
    } catch (err) {
      console.error('Error fetching device status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Điều khiển thiết bị
  const controlDevice = async (device, state) => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API tương ứng
      switch (device) {
        case 'pump':
          await controlPump(state);
          break;
        case 'fan':
          await controlFan(state);
          break;
        case 'light':
          await controlLight(state);
          break;
        default:
          throw new Error('Invalid device');
      }

      // Cập nhật state ngay lập tức để UI responsive
      setDeviceStatus(prev => ({ ...prev, [device]: state }));
      
      // Fetch lại status từ backend để đảm bảo đồng bộ
      setTimeout(() => {
        fetchDeviceStatus();
      }, 500);
      
    } catch (err) {
      console.error(`Error controlling ${device}:`, err);
      setError(`Không thể điều khiển ${device}. Vui lòng thử lại.`);
      
      // Revert state nếu có lỗi
      setDeviceStatus(prev => ({ ...prev, [device]: !state }));
    } finally {
      setLoading(false);
    }
  };

  // Load initial device status
  useEffect(() => {
    fetchDeviceStatus();
  }, []);

  return { 
    deviceStatus, 
    loading, 
    error, 
    controlDevice, 
    refetch: fetchDeviceStatus 
  };
};