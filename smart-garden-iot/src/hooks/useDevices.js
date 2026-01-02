import { useState, useEffect } from 'react';
import { deviceAPI } from '../services/api';

export const useDevices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper: Lấy icon và màu sắc dựa trên ID hoặc Type
    const getDeviceTypeInfo = (deviceId, typeOverride) => {
        const type = typeOverride || (deviceId.includes('fan') ? 'fan' : deviceId.includes('light') ? 'light' : 'pump');
        switch (type) {
            case 'fan': return { icon: '🌀', color: 'green', label: 'Quạt gió' };
            case 'light': return { icon: '💡', color: 'yellow', label: 'Đèn LED' };
            default: return { icon: '💧', color: 'blue', label: 'Máy bơm' };
        }
    };

    const fetchDevices = async () => {
        try {
            setLoading(true);

            // 1. Lấy trạng thái thực tế từ Backend (Chỉ chứa pump, fan, light thật)
            const backendDevices = await deviceAPI.getAllDevices();

            // Tạo map trạng thái thật để tra cứu nhanh
            // Ví dụ: { pump: 'ON', fan: 'OFF' }
            const realStateMap = {};
            backendDevices.forEach(d => {
                realStateMap[d.deviceId] = d.state;
            });

            // 2. Lấy danh sách thiết bị ảo từ LocalStorage
            const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');

            // 3. Trộn dữ liệu: Thiết bị ảo sẽ lấy trạng thái của thiết bị thật tương ứng
            // Nếu customData rỗng (lần đầu chạy), dùng backendDevices làm gốc

            let finalDevicesList = [];

            // A. Nếu chưa thêm thiết bị ảo nào, hiển thị thiết bị thật
            if (Object.keys(customData).length === 0) {
                finalDevicesList = backendDevices.map(d => ({
                    ...d,
                    customName: d.deviceId,
                    zone: 'Hệ thống gốc',
                    type: d.deviceId.includes('fan') ? 'fan' : d.deviceId.includes('light') ? 'light' : 'pump',
                    ...getDeviceTypeInfo(d.deviceId)
                }));
            } else {
                // B. Nếu đã có thiết bị ảo, hiển thị thiết bị ảo nhưng State lấy từ thiết bị thật
                finalDevicesList = Object.entries(customData).map(([virtualId, info]) => {
                    // Xác định xem thiết bị ảo này thuộc loại nào (pump/fan/light)
                    let realType = 'pump';
                    if (info.type === 'fan' || virtualId.includes('fan')) realType = 'fan';
                    else if (info.type === 'light' || virtualId.includes('light')) realType = 'light';

                    // Lấy trạng thái thật từ Backend map (nếu không tìm thấy thì mặc định OFF)
                    // Lưu ý: ID thật trong DB là "pump", "fan", "light"
                    const realState = realStateMap[realType] || 'OFF';

                    return {
                        deviceId: virtualId, // ID ảo (để hiển thị và xóa)
                        customName: info.customName,
                        zone: info.zone,
                        type: info.type,
                        state: realState, // <--- QUAN TRỌNG: Dùng trạng thái thật!
                        lastUpdated: new Date().toISOString(), // Hoặc lấy từ real device nếu muốn
                        ...getDeviceTypeInfo(virtualId, info.type)
                    };
                });
            }

            setDevices(finalDevicesList);
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDevice = async (virtualDeviceId, currentState) => {
        try {
            setLoading(true);
            const newState = currentState === 'ON' ? 'OFF' : 'ON';

            // --- LOGIC ĐỒNG BỘ UI (Optimistic Update) ---
            setDevices(prev => {
                // 1. Tìm xem thiết bị vừa bấm là loại gì (pump, fan hay light?)
                const clickedDevice = prev.find(d => d.deviceId === virtualDeviceId);

                // Nếu không tìm thấy hoặc chưa có type, mặc định coi là pump để an toàn
                const targetType = clickedDevice ? clickedDevice.type : 'pump';

                // 2. Duyệt qua TẤT CẢ thiết bị trên màn hình
                // Nếu thiết bị nào có cùng 'type' (ví dụ cùng là 'pump') -> Cập nhật trạng thái hết!
                return prev.map(d =>
                    d.type === targetType ? { ...d, state: newState } : d
                );
            });

            // --- GỌI API ---
            // Gọi hàm api.js vừa sửa ở bước 1
            await deviceAPI.controlDevice(virtualDeviceId, newState);

            // Fetch lại để chắc chắn data khớp với DB (tuỳ chọn)
            // setTimeout(fetchDevices, 500); 

        } catch (error) {
            console.error('Control failed', error);
            // Nếu lỗi thì load lại danh sách cũ để hòan tác
            fetchDevices();
        } finally {
            setLoading(false);
        }
    };

    // Lưu thông tin custom vào LocalStorage
    const saveDeviceSettings = (deviceId, settings) => {
        const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');
        customData[deviceId] = settings;
        localStorage.setItem('deviceCustomData', JSON.stringify(customData));
        fetchDevices();
    };

    // Xóa thiết bị (chỉ xóa custom data, vì DB backend cố định)
    const deleteDeviceSettings = (deviceId) => {
        const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');
        delete customData[deviceId];
        localStorage.setItem('deviceCustomData', JSON.stringify(customData));
        fetchDevices();
    };

    useEffect(() => {
        fetchDevices();
        const interval = setInterval(fetchDevices, 5000); // Auto refresh
        return () => clearInterval(interval);
    }, []);

    return { devices, loading, toggleDevice, saveDeviceSettings, deleteDeviceSettings, refetch: fetchDevices };
};