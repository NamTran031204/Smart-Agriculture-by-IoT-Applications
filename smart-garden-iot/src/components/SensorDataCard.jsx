import React from 'react';
import { Droplets } from 'lucide-react';

const SensorDataCard = ({ sensorData }) => {
  return (
    <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Dữ liệu môi trường</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Trực tiếp</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-red-50 p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🌡️</span>
            <span className="text-xs text-gray-600">Nhiệt độ</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{sensorData.temperature}°C</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="text-blue-600" size={16} />
            <span className="text-xs text-gray-600">Độ ẩm KK</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{sensorData.humidity}%</p>
        </div>
        <div className="bg-green-50 p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="text-green-600" size={16} />
            <span className="text-xs text-gray-600">Độ ẩm đất</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{sensorData.soilMoisture}%</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">☀️</span>
            <span className="text-xs text-gray-600">Ánh sáng</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{sensorData.light} lux</p>
        </div>
      </div>
    </div>
  );
};

export default SensorDataCard;