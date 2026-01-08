import React, { useState, useEffect } from 'react';
import { Plus, Sprout, MapPin, ChevronDown, Trash2, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';

import Header from './components/Header';
import HeroSensorDisplay from './components/HeroSensorDisplay';
import ChartSection from './components/ChartSection';
import BottomNavigation from './components/BottomNavigation';
import DeviceCard from './components/DeviceCard';
import DeviceModal from './components/DeviceModal';
import { useDevices } from './hooks/useDevices';
import { useSensorData } from './hooks/useSensorData';

const DEFAULT_GARDENS = [
  { id: 1, name: 'Vườn Mặc Định', desc: 'Khu vực chính' }
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  
  const [gardens, setGardens] = useState(() => {
    const saved = localStorage.getItem('my_gardens');
    return saved ? JSON.parse(saved) : DEFAULT_GARDENS;
  });
  
  const [selectedGardenId, setSelectedGardenId] = useState(() => {
    return gardens[0]?.id || 1;
  });

  useEffect(() => {
    localStorage.setItem('my_gardens', JSON.stringify(gardens));
  }, [gardens]);

  const { 
    devices, 
    loading: devicesLoading, 
    toggleDevice, 
    saveDeviceSettings, 
    deleteDeviceSettings,
    refetch: refetchDevices 
  } = useDevices(selectedGardenId);

  const { sensorData, refetch: refetchSensors } = useSensorData();

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

  const handleAddGarden = () => {
    const name = prompt("Nhập tên vườn mới:");
    if (name) {
      const newGarden = {
        id: Date.now(),
        name: name,
        desc: 'Vườn mới tạo'
      };
      setGardens([...gardens, newGarden]);
      setSelectedGardenId(newGarden.id);
    }
  };

  const handleDeleteGarden = () => {
    if (gardens.length <= 1) {
      alert("Bạn phải giữ lại ít nhất 1 vườn!");
      return;
    }
    if (confirm("Bạn có chắc muốn xóa vườn này?")) {
      const newGardens = gardens.filter(g => g.id !== selectedGardenId);
      setGardens(newGardens);
      setSelectedGardenId(newGardens[0].id);
    }
  };

  const currentGarden = gardens.find(g => g.id === selectedGardenId) || gardens[0];

  return (
    <div className="min-h-screen bg-slate-100 pb-32 2xl:pb-8">
      
      <div className="2xl:hidden relative">
         <Header onRefresh={handleRefresh} loading={devicesLoading} />
         <button 
           onClick={logout} 
           className="absolute top-3 right-16 p-2 text-red-500 bg-white rounded-full shadow-sm"
           title="Đăng xuất"
         >
           <LogOut size={20} />
         </button>
      </div>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 2xl:px-8 pt-4 2xl:pt-8 space-y-8">

        <div className="bg-white rounded-3xl shadow-sm p-6 2xl:p-8 flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-8">
          
          <div className="flex items-start gap-4 2xl:w-auto 2xl:min-w-[400px]">
            <div className="bg-green-100 p-4 rounded-2xl hidden 2xl:block">
              <Sprout className="text-green-600 h-10 w-10" />
            </div>
            <div className="flex-1 relative group">
               <select 
                 value={selectedGardenId}
                 onChange={(e) => setSelectedGardenId(Number(e.target.value))}
                 className="appearance-none bg-transparent font-bold text-gray-900 text-3xl 2xl:text-5xl w-full focus:outline-none cursor-pointer py-2 pr-8"
               >
                 {gardens.map(g => (
                   <option key={g.id} value={g.id} className="text-lg">{g.name}</option>
                 ))}
               </select>
               <ChevronDown size={32} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-500 flex items-center gap-2 text-xl">
                  <MapPin size={20} /> {currentGarden?.desc}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                 <button onClick={handleAddGarden} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors font-medium">
                    <Plus size={20} /> Thêm vườn
                 </button>
                 {gardens.length > 1 && (
                    <button onClick={handleDeleteGarden} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium">
                        <Trash2 size={20} /> Xóa
                    </button>
                 )}
              </div>
            </div>
          </div>

          {/* Cảm biến & Logout */}
          <div className="flex-1 2xl:border-l 2xl:border-gray-100 2xl:pl-10 relative">
             <div className="hidden 2xl:flex absolute top-0 right-0 items-center gap-4 mb-6">
                <span className="text-gray-600 font-medium text-lg">Chào, {user?.username || 'User'}</span>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-bold"
                >
                  <LogOut size={20} /> Đăng xuất
                </button>
             </div>
             
             <div className="2xl:mt-12">
                <HeroSensorDisplay sensorData={sensorData} onRefresh={handleRefresh} loading={devicesLoading} />
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-8 items-start">
          
          <div className="2xl:col-span-8">
            <ChartSection />
          </div>

          <div className="2xl:col-span-4 bg-white rounded-3xl shadow-sm p-6">
             <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-900 text-2xl">Thiết bị ({devices.length})</h3>
              <button
                onClick={() => { setEditingDevice(null); setModalOpen(true); }}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
              >
                <Plus size={24} /> <span className="hidden sm:inline">Thêm</span>
              </button>
            </div>

             {devicesLoading && devices.length === 0 ? (
                 <div className="text-center py-12 opacity-50 text-xl">Đang tải...</div>
              ) : devices.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl">
                      <p className="text-gray-500 text-xl">Chưa có thiết bị nào</p>
                  </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-6">
                  {devices.map((device) => (
                    <DeviceCard
                      key={device.deviceId}
                      device={device}
                      onToggle={toggleDevice}
                      onEdit={(dev) => { setEditingDevice(dev); setModalOpen(true); }}
                      onDelete={deleteDeviceSettings}
                      loading={devicesLoading}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>

      </main>

      <DeviceModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialData={editingDevice} 
        onSave={handleSaveDevice} 
        isEditing={!!editingDevice} 
      />
      
      <div className="2xl:hidden">
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

const MainScreen = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <LoginPage />;
  }

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <MainScreen />
    </AuthProvider>
  );
}

export default App;