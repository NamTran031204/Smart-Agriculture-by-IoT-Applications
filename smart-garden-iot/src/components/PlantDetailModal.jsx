import React from 'react';
import { Droplets, X } from 'lucide-react';

const PlantDetailModal = ({ plant, onClose, onControlPump, onControlFan, loading }) => {
  if (!plant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="text-green-600" size={20} />
            <h3 className="font-bold text-gray-800">Chi tiết cây trồng</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">{plant.name}</h2>

        <img
          src={plant.image}
          alt={plant.name}
          className="w-full h-56 object-cover rounded-2xl mb-4"
        />

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl">
            <span className="text-2xl">🌡️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Nhiệt độ</p>
              <p className="font-bold text-gray-800">{plant.temperature}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl">
            <Droplets className="text-blue-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Độ ẩm không khí</p>
              <p className="font-bold text-gray-800">{plant.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-xl">
            <span className="text-2xl">☀️</span>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Thời gian phơi sáng</p>
              <p className="font-bold text-gray-800">{plant.sunlight}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl">
            <Droplets className="text-green-600" size={24} />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Độ ẩm đất</p>
              <p className="font-bold text-gray-800">{plant.soilMoisture}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-xl">
            <span className="text-2xl">💧</span>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Lần tưới gần nhất</p>
              <p className="font-bold text-gray-800">{plant.lastWatered}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              onControlPump(true);
              onClose();
            }}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Droplets size={20} />
            Tưới nước
          </button>
          <button 
            onClick={() => {
              onControlFan(true);
              onClose();
            }}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">⚙️</span>
            Bật quạt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantDetailModal;