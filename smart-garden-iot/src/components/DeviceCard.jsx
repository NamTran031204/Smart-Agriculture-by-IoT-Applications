// src/components/DeviceCard.jsx
import React from 'react';
import { Power, Edit2, Trash2 } from 'lucide-react';

const DeviceCard = ({ device, onToggle, onEdit, onDelete, loading }) => {
  const isOn = device.state === 'ON';

  return (
    // 1. Tăng padding container (p-4 -> p-4 lg:p-5)
    <div className={`bg-white rounded-2xl p-4 lg:p-5 shadow-sm transition-all border-2 flex flex-col justify-between ${
      isOn ? 'border-green-500' : 'border-transparent'
    }`}>
      
      {/* Header Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 lg:gap-4">
          
          {/* Icon nền tròn - Tăng kích thước trên Desktop */}
          <div className={`p-2 lg:p-3 rounded-full transition-colors ${isOn ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className="text-2xl lg:text-3xl">{device.icon}</span>
          </div>
          
          <div>
            {/* 2. Tên thiết bị to hơn (text-base lg:text-lg) */}
            <h4 className="font-bold text-gray-900 text-base lg:text-lg leading-tight">
                {device.customName}
            </h4>
            <p className="text-xs lg:text-sm text-gray-500 mt-0.5">{device.zone}</p>
          </div>
        </div>
        
        {/* Nút sửa/xóa */}
        <div className="flex gap-1">
          <button onClick={() => onEdit(device)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(device.deviceId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Info Status */}
      <div className="mb-4 bg-gray-50 p-2.5 rounded-xl">
        <div className="flex items-center justify-between text-xs lg:text-sm">
          <span className="text-gray-500 font-medium">ID: {device.deviceId}</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[10px] lg:text-xs tracking-wide ${
            isOn ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {isOn ? 'ĐANG CHẠY' : 'ĐÃ TẮT'}
          </span>
        </div>
      </div>

      {/* Nút Bật/Tắt - Tăng chiều cao trên desktop */}
      <button
        onClick={() => onToggle(device.deviceId, device.state)}
        disabled={loading}
        className={`w-full py-3 lg:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
          isOn
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' 
            : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Power size={20} className={isOn ? 'fill-current' : ''} />
        <span className="text-sm lg:text-base">{isOn ? 'Đang Bật' : 'Bật Thiết Bị'}</span>
      </button>
    </div>
  );
};

export default DeviceCard;