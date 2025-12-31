import React, { useState, useEffect } from 'react';
import { Droplets, Calendar as CalendarIcon, RefreshCw, TrendingUp } from 'lucide-react';
import Header from './components/Header';
import SensorDataCard from './components/SensorDataCard';
import DeviceControlPanel from './components/DeviceControlPanel';
import Calendar from './components/Calendar';
import PlantCard from './components/PlantCard';
import PlantDetailModal from './components/PlantDetailModal';
import SettingsModal from './components/SettingsModal';
import BottomNavigation from './components/BottomNavigation';
import ErrorAlert from './components/ErrorAlert';
import { useSensorData } from './hooks/useSensorData';
import { useDeviceControl } from './hooks/useDeviceControl';
import { usePlants } from './hooks/usePlants';
import { 
  getStoredThresholds, 
  saveThresholds, 
  getAutoRefreshSetting, 
  saveAutoRefreshSetting 
} from './utils/constants';

function App() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(getAutoRefreshSetting());
  const [thresholds, setThresholds] = useState(getStoredThresholds());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(2);
  const [activeTab, setActiveTab] = useState('home');

  const { sensorData, loading: sensorLoading, refetch: refetchSensor } = useSensorData(autoRefresh);
  const { deviceStatus, loading: deviceLoading, controlDevice, refetch: refetchDevice } = useDeviceControl();
  const { plants, loading: plantsLoading, refetch: refetchPlants } = usePlants();

  const handleRefresh = () => {
    refetchSensor();
    refetchDevice();
    refetchPlants();
  };

  // Lưu thresholds vào localStorage (vì backend không có API này)
  const updateThresholds = (newThresholds) => {
    try {
      setLoading(true);
      setError(null);
      
      const success = saveThresholds(newThresholds);
      if (success) {
        setThresholds(newThresholds);
        setShowSettings(false);
      } else {
        setError('Không thể lưu cài đặt. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Error updating thresholds:', err);
      setError('Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Lưu auto refresh setting
  const handleAutoRefreshToggle = () => {
    const newValue = !autoRefresh;
    setAutoRefresh(newValue);
    saveAutoRefreshSetting(newValue);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'settings') {
      setShowSettings(true);
    }
  };

  const handleControlPump = (state) => {
    controlDevice('pump', state);
  };

  const handleControlFan = (state) => {
    controlDevice('fan', state);
  };

  const isLoading = sensorLoading || deviceLoading || plantsLoading;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header 
        onRefresh={handleRefresh}
        onSettingsOpen={() => setShowSettings(true)}
        loading={isLoading}
      />

      <ErrorAlert error={error} onClose={() => setError(null)} />

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

      <SensorDataCard sensorData={sensorData} />
      
      <DeviceControlPanel 
        deviceStatus={deviceStatus}
        onControl={controlDevice}
        loading={deviceLoading}
      />

      <Calendar 
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Plants Grid */}
      <div className="px-4 py-4">
        <h3 className="font-bold text-gray-800 mb-4">Cây Trồng Của Bạn</h3>
        {plantsLoading && plants.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto text-green-600" size={32} />
            <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {plants.map((plant) => (
              <PlantCard 
                key={plant.id}
                plant={plant}
                onClick={() => setSelectedPlant(plant)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Droplets className="text-green-600" size={24} />
          </div>
          <h4 className="font-semibold text-gray-800">Hệ thống tưới</h4>
          <p className="text-sm text-gray-500">
            {deviceStatus.pump ? 'Đang hoạt động' : '8/8 sẵn sàng'}
          </p>
        </div>
        <div className="bg-pink-50 rounded-2xl p-4 text-center">
          <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="text-pink-600" size={24} />
          </div>
          <h4 className="font-semibold text-gray-800">Cảm biến</h4>
          <p className="text-sm text-gray-500">Tất cả ổn định</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          setActiveTab('home');
        }}
        thresholds={thresholds}
        onSave={updateThresholds}
        loading={loading}
        autoRefresh={autoRefresh}
        onAutoRefreshToggle={handleAutoRefreshToggle}
      />

      {/* Plant Detail Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        onControlPump={handleControlPump}
        onControlFan={handleControlFan}
        loading={deviceLoading}
      />
    </div>
  );
}

export default App;