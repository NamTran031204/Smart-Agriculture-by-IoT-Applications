import React from 'react';
import { Power, Edit2, Trash2 } from 'lucide-react';

const DeviceCard = ({ device, onToggle, onEdit, onDelete, loading }) => {
  const isOn = device.state === 'ON';

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm transition-all border-2 ${
      isOn ? 'border-green-500' : 'border-transparent'
    }`}>
      {/* Header Card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon nền tròn */}
          <div className={`p-2 rounded-full ${isOn ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span className="text-2xl">{device.icon}</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{device.customName}</h4>
            <p className="text-xs text-gray-500">{device.zone}</p>
          </div>
        </div>
        
        {/* Nút sửa/xóa */}
        <div className="flex gap-1">
          <button onClick={() => onEdit(device)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(device.deviceId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info Status */}
      <div className="mb-4 bg-gray-50 p-2 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">ID: {device.deviceId}</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
            isOn ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
          }`}>
            {isOn ? 'ĐANG CHẠY' : 'ĐÃ TẮT'}
          </span>
        </div>
      </div>

      {/* Nút Bật/Tắt - Đã sửa lỗi mất màu */}
      <button
        onClick={() => onToggle(device.deviceId, device.state)}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 ${
          isOn
            ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200' // Khi Bật: Xanh lá
            : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50' // Khi Tắt: Màu trắng, viền xám
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Power size={18} className={isOn ? 'fill-current' : ''} />
        {isOn ? 'Đang Bật' : 'Bật Thiết Bị'}
      </button>
    </div>
  );
};

export default DeviceCard;