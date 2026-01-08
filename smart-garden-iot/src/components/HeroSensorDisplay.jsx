import React from 'react';
import { Thermometer, Droplets, Wind, Sun, RefreshCw } from 'lucide-react';

const SensorItem = ({ icon: Icon, label, value, unit, colorClass }) => (
  <div className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-colors flex-1 min-w-[140px]">
    <div className={`${colorClass} p-3 rounded-full mr-4`}>
      <Icon size={28} className="text-current" />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1 whitespace-nowrap">{label}</p>
      <p className="text-3xl lg:text-4xl font-bold text-gray-900">
        {value !== null && value !== undefined ? value : '--'}
        <span className="text-lg lg:text-xl text-gray-500 ml-1 font-normal">{unit}</span>
      </p>
    </div>
  </div>
);

const HeroSensorDisplay = ({ sensorData, onRefresh, loading }) => {
  const { temp, humid, moisture, optical } = sensorData || {};

  return (
    <div className="relative h-full flex flex-col justify-center">
      <button 
        onClick={onRefresh} 
        disabled={loading}
        className="absolute -top-2 right-0 p-2 text-gray-400 hover:text-green-600 transition-colors lg:block hidden"
        title="Làm mới dữ liệu"
      >
        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
      </button>
      
      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        
        <SensorItem
          icon={Thermometer} label="Nhiệt độ KK"
          value={temp} unit="°C" colorClass="bg-red-100 text-red-600"
        />
        
        <SensorItem
          icon={Wind} label="Độ ẩm KK"
          value={humid} unit="%" colorClass="bg-blue-100 text-blue-600"
        />
        
        <SensorItem
          icon={Droplets} label="Độ ẩm đất"
          value={moisture} unit="%" colorClass="bg-teal-100 text-teal-600"
        />
        
        <SensorItem
          icon={Sun} label="Ánh sáng"
          value={optical} unit="Lux" colorClass="bg-yellow-100 text-yellow-600"
        />

      </div>
       {!sensorData && (
        <p className="text-center text-gray-400 mt-2 text-sm">Chưa có dữ liệu cảm biến</p>
       )}
    </div>
  );
};

export default HeroSensorDisplay;