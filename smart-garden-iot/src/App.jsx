import React, { useState } from 'react';
import { Plus, RefreshCw, Droplets, Calendar as CalendarIcon } from 'lucide-react';

// Components
import Header from './components/Header';
import SensorDataCard from './components/SensorDataCard'; // Cần update file này ở bước 6
import Calendar from './components/Calendar';
import BottomNavigation from './components/BottomNavigation';
import DeviceCard from './components/DeviceCard';
import DeviceModal from './components/DeviceModal';

// Hooks
import { useDevices } from './hooks/useDevices';
import { useSensorData } from './hooks/useSensorData';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const { 
    devices, 
    loading: devicesLoading, 
    toggleDevice, 
    saveDeviceSettings, 
    deleteDeviceSettings,
    refetch: refetchDevices 
  } = useDevices();

  const { 
    sensorData, 
    refetch: refetchSensors 
  } = useSensorData();

  const handleRefresh = () => {
    refetchDevices();
    refetchSensors();
  };

  const handleSaveDevice = (formData) => {
    saveDeviceSettings(formData.deviceId, {
      customName: formData.customName,
      zone: formData.zone,
      type: formData.type
    });
    setModalOpen(false);
    setEditingDevice(null);
  };

  const openEditModal = (device) => {
    setEditingDevice(device);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header onRefresh={handleRefresh} loading={devicesLoading} />

      {/* Garden Info Card */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-full">
            <Droplets className="text-green-600" size={24} />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800">Vườn Thông Minh | Garden A1</h2>
            <p className="text-sm text-gray-500">Hệ thống tưới tiêu tự động</p>
          </div>
          <button className="text-green-600">
            <CalendarIcon size={24} />
          </button>
        </div>
      </div>

      {/* Sensor Data - Cập nhật component này để hiển thị grid 4 ô */}
      <SensorDataCard sensorData={sensorData} />

      {/* Calendar */}
      <Calendar />

      {/* Device List Section */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Quản lý thiết bị</h3>
          <button
            onClick={() => {
              setEditingDevice(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={18} />
            Thêm thiết bị
          </button>
        </div>

        {devicesLoading && devices.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto text-green-600" size={32} />
            <p className="text-gray-500 mt-2">Đang tải thiết bị...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {devices.map((device) => (
              <DeviceCard
                key={device.deviceId}
                device={device}
                onToggle={toggleDevice}
                onEdit={openEditModal}
                onDelete={deleteDeviceSettings}
                loading={devicesLoading}
              />
            ))}
          </div>
        )}
      </div>

      <DeviceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingDevice}
        onSave={handleSaveDevice}
        isEditing={!!editingDevice}
      />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;