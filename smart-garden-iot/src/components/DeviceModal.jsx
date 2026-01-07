import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DeviceModal = ({ isOpen, onClose, initialData, onSave, isEditing }) => {
  const [form, setForm] = useState({ deviceId: '', customName: '', zone: '', type: 'pump' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ deviceId: '', customName: '', zone: '', type: 'pump' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const deviceTypes = [
    { value: 'pump', label: 'Máy bơm', icon: '💧' },
    { value: 'fan', label: 'Quạt', icon: '🌀' },
    { value: 'light', label: 'Đèn', icon: '💡' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">
            {isEditing ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Chọn loại thiết bị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại thiết bị</label>
            <div className="grid grid-cols-3 gap-2">
              {deviceTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, type: type.value })}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                    form.type === type.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID thiết bị {isEditing && '(Không đổi)'}</label>
            <input
              type="text"
              value={form.deviceId}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
              disabled={isEditing}
              placeholder="Ví dụ: pump, fan, light"
              className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isEditing ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
              }`}
            />
          </div>

          {/* Input Tên & Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
            <input
              type="text"
              value={form.customName}
              onChange={(e) => setForm({ ...form, customName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vùng/Khu vực</label>
            <input
              type="text"
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <button
          onClick={() => onSave(form)}
          disabled={!form.deviceId || !form.customName}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {isEditing ? 'Lưu thay đổi' : 'Thêm thiết bị'}
        </button>
      </div>
    </div>
  );
};

export default DeviceModal;