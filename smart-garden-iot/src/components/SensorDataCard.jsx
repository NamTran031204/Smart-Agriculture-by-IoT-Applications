import React from 'react';

const SensorDataCard = ({ sensorData }) => {
  if (!sensorData) return null;

  return (
    <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Dữ liệu môi trường hiện tại
      </h3>
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-xs text-gray-500">Nhiệt độ</p>
          <p className="text-lg font-bold text-red-600">
            {sensorData.temp || sensorData.temperature || '--'}°C
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Độ ẩm KK</p>
          <p className="text-lg font-bold text-blue-600">
            {sensorData.humid || sensorData.humidity || '--'}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Độ ẩm đất</p>
          <p className="text-lg font-bold text-green-600">
            {sensorData.moisture || sensorData.soilMoisture || '--'}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Ánh sáng</p>
          <p className="text-lg font-bold text-yellow-600">
            {sensorData.optical || sensorData.light || '--'} lux
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensorDataCard;