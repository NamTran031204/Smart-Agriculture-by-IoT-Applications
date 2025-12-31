import React from 'react';
import { Droplets } from 'lucide-react';

const DeviceControlPanel = ({ deviceStatus, onControl, loading }) => {
  return (
    <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Điều khiển thiết bị</h3>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onControl('pump', !deviceStatus.pump)}
          disabled={loading}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
            deviceStatus.pump 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600'
          } ${loading ? 'opacity-50' : 'hover:scale-105'}`}
        >
          <Droplets size={24} />
          <span className="text-xs font-medium">Máy bơm</span>
          <span className="text-xs">{deviceStatus.pump ? 'BẬT' : 'TẮT'}</span>
        </button>
        
        <button
          onClick={() => onControl('fan', !deviceStatus.fan)}
          disabled={loading}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
            deviceStatus.fan 
              ? 'bg-green-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600'
          } ${loading ? 'opacity-50' : 'hover:scale-105'}`}
        >
          <span className="text-2xl">🌀</span>
          <span className="text-xs font-medium">Quạt</span>
          <span className="text-xs">{deviceStatus.fan ? 'BẬT' : 'TẮT'}</span>
        </button>
        
        <button
          onClick={() => onControl('light', !deviceStatus.light)}
          disabled={loading}
          className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
            deviceStatus.light 
              ? 'bg-yellow-500 text-white shadow-lg' 
              : 'bg-gray-100 text-gray-600'
          } ${loading ? 'opacity-50' : 'hover:scale-105'}`}
        >
          <span className="text-2xl">💡</span>
          <span className="text-xs font-medium">Đèn LED</span>
          <span className="text-xs">{deviceStatus.light ? 'BẬT' : 'TẮT'}</span>
        </button>
      </div>
    </div>
  );
};

export default DeviceControlPanel;