import { useState, useEffect } from 'react';
import { sensorAPI } from '../services/api';
import { MOCK_SENSOR_DATA, AUTO_REFRESH_INTERVAL } from '../utils/constants';

export const useSensorData = (autoRefresh = true) => {
  const [sensorData, setSensorData] = useState(MOCK_SENSOR_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sensorAPI.getLatest();
      setSensorData(data);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(err.message);
      setSensorData(MOCK_SENSOR_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchSensorData, AUTO_REFRESH_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return { sensorData, loading, error, refetch: fetchSensorData };
};