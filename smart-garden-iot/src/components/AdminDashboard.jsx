import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, Sprout, Cpu, Search, Trash2, Eye, 
  MoreVertical, LogOut, ShieldCheck, X 
} from 'lucide-react';
import axios from 'axios';
const INITIAL_USERS = [
  {
    id: 1,
    username: 'user_nguyen_a',
    fullName: 'Nguyễn Văn A',
    email: 'vana@gmail.com',
    status: 'active',
    joinDate: '2024-12-15',
    gardens: [
      {
        id: 'g1',
        name: 'Vườn Sân Thượng',
        address: 'Hà Nội',
        devices: [
          { id: 'pump_01', name: 'Máy bơm 1', type: 'pump', state: 'ON' },
          { id: 'led_01', name: 'Đèn Led', type: 'light', state: 'OFF' },
          { id: 'fan_01', name: 'Quạt thông gió', type: 'fan', state: 'ON' }
        ]
      },
      {
        id: 'g2',
        name: 'Ban Công Phòng Ngủ',
        address: 'Hà Nội',
        devices: [
          { id: 'mist_01', name: 'Phun sương', type: 'pump', state: 'OFF' }
        ]
      }
    ]
  },
  {
    id: 2,
    username: 'farmer_b',
    fullName: 'Trần Thị B',
    email: 'tranb@yahoo.com',
    status: 'active',
    joinDate: '2025-01-02',
    gardens: [
      {
        id: 'g3',
        name: 'Vườn Rau Sạch',
        address: 'Hải Phòng',
        devices: [
          { id: 'pump_main', name: 'Bơm tổng', type: 'pump', state: 'OFF' },
          { id: 'sensor_01', name: 'Cảm biến đất', type: 'sensor', state: 'ACTIVE' }
        ]
      }
    ]
  },
  {
    id: 3,
    username: 'demo_guest',
    fullName: 'Khách Demo',
    email: 'guest@demo.com',
    status: 'inactive',
    joinDate: '2025-01-10',
    gardens: [] // User này chưa tạo vườn
  }
];

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null); // Để hiện Modal chi tiết

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:8080/api/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Lỗi tải danh sách user:", error);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const totalGardens = users.reduce((acc, u) => acc + (u.gardens?.length || 0), 0);
  const totalDevices = users.reduce((acc, u) => 
    acc + (u.gardens || []).reduce((dAcc, g) => dAcc + (g.devices?.length || 0), 0), 0
  );
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = (userId) => {
    if(confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      
      {/* --- HEADER ADMIN --- */}
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Admin Portal</h1>
            <p className="text-xs text-gray-400">Hệ thống quản lý tập trung</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Xin chào, {user?.fullName || 'Admin'}</span>
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        
        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
              <Users size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tổng người dùng</p>
              <h3 className="text-3xl font-bold text-gray-800">{totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-4 rounded-xl text-green-600">
              <Sprout size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tổng số vườn</p>
              <h3 className="text-3xl font-bold text-gray-800">{totalGardens}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
              <Cpu size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tổng thiết bị</p>
              <h3 className="text-3xl font-bold text-gray-800">{totalDevices}</h3>
            </div>
          </div>
        </div>

        {/* --- USERS TABLE SECTION --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Danh sách khách hàng</h2>
            
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Tìm kiếm theo tên hoặc tài khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">User Info</th>
                  <th className="p-4 font-semibold">Ngày tham gia</th>
                  <th className="p-4 font-semibold text-center">Số vườn</th>
                  <th className="p-4 font-semibold text-center">Thiết bị</th>
                  <th className="p-4 font-semibold">Trạng thái</th>
                  <th className="p-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const userDeviceCount = (u.gardens || []).reduce((acc, g) => acc + (g.devices?.length || 0), 0);
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.fullName}</p>
                            <p className="text-xs text-gray-500">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{u.joinDate}</td>
                      <td className="p-4 text-center">
                        <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold">
                          {u.gardens?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-xs font-bold">
                          {userDeviceCount}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          u.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {u.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedUser(u)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa người dùng"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Không tìm thấy người dùng nào.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODAL CHI TIẾT USER --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-bold">Chi tiết tài sản</h3>
                <p className="text-blue-100 text-sm">Của khách hàng: {selectedUser.fullName}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
              {(selectedUser.gardens || []).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  User này chưa tạo vườn nào.
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedUser.gardens.map((garden) => (
                    <div key={garden.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-50">
                        <Sprout className="text-green-600" />
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{garden.name}</h4>
                          <p className="text-xs text-gray-500">{garden.address}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {garden.devices.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Chưa có thiết bị</p>
                        ) : (
                            garden.devices.map(device => (
                                <div key={device.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${device.state === 'ON' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <div>
                                            <p className="font-medium text-gray-700 text-sm">{device.name}</p>
                                            <p className="text-xs text-gray-400 uppercase">{device.type} • ID: {device.id}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        device.state === 'ON' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {device.state}
                                    </span>
                                </div>
                            ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white text-right">
                <button 
                    onClick={() => setSelectedUser(null)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                    Đóng
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;