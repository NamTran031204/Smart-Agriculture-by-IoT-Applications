import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  thresholds, 
  onSave, 
  loading,
  autoRefresh,
  onAutoRefreshToggle
}) => {
  const [localThresholds, setLocalThresholds] = useState(thresholds);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localThresholds);
  };

  const handleInputChange = (field, value) => {
    setLocalThresholds(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="text-green-600" size={20} />
            <h3 className="font-bold text-gray-800">Cài đặt ngưỡng tự động</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Soil Moisture Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ ẩm đất tối thiểu (%)
            </label>
            <input
              type="number"
              value={localThresholds.soilMoistureMin}
              onChange={(e) => handleInputChange('soilMoistureMin', e.target.value)}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Máy bơm sẽ bật khi độ ẩm đất thấp hơn giá trị này
            </p>
          </div>

          {/* Temperature Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhiệt độ tối đa (°C)
            </label>
            <input
              type="number"
              value={localThresholds.temperatureMax}
              onChange={(e) => handleInputChange('temperatureMax', e.target.value)}
              min="0"
              max="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Quạt sẽ bật khi nhiệt độ cao hơn giá trị này
            </p>
          </div>

          {/* Light Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cường độ ánh sáng tối thiểu (lux)
            </label>
            <input
              type="number"
              value={localThresholds.lightMin}
              onChange={(e) => handleInputChange('lightMin', e.target.value)}
              min="0"
              max="10000"
              step="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Đèn LED sẽ bật khi ánh sáng thấp hơn giá trị này
            </p>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-700">Tự động làm mới dữ liệu</p>
              <p className="text-xs text-gray-500">Cập nhật mỗi 5 giây</p>
            </div>
            <button
              onClick={onAutoRefreshToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoRefresh ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <div className="flex gap-2">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <p className="text-xs font-medium text-yellow-800">Lưu ý</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Hệ thống sẽ tự động điều khiển thiết bị dựa trên các ngưỡng này. 
                  Đảm bảo các giá trị phù hợp với loại cây trồng của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;