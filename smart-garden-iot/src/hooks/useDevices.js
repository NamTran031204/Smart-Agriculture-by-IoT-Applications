// src/hooks/useDevices.js
import { useState, useEffect } from 'react';
import { deviceAPI } from '../services/api';

// Nhận tham số currentGardenId để lọc thiết bị theo từng vườn
export const useDevices = (currentGardenId) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper: Lấy icon và màu sắc dựa trên ID hoặc Type (Giữ logic thông minh của bản cũ)
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

            // Tạo map trạng thái thật để tra cứu nhanh: { pump: 'ON', fan: 'OFF' }
            const realStateMap = {};
            backendDevices.forEach(d => {
                realStateMap[d.deviceId] = d.state;
            });

            // 2. Lấy danh sách thiết bị ảo từ LocalStorage
            const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');

            let finalDevicesList = [];

            // A. Nếu chưa thêm thiết bị ảo nào (lần đầu chạy), hiển thị thiết bị gốc
            // Mặc định gán các thiết bị gốc này vào Vườn 1 (ID: 1)
            if (Object.keys(customData).length === 0) {
                finalDevicesList = backendDevices.map(d => ({
                    ...d,
                    customName: d.deviceId,
                    zone: 'Hệ thống gốc',
                    type: d.deviceId.includes('fan') ? 'fan' : d.deviceId.includes('light') ? 'light' : 'pump',
                    gardenId: 1, // Mặc định vườn 1
                    ...getDeviceTypeInfo(d.deviceId)
                }));
            } else {
                // B. Nếu đã có dữ liệu custom, map dữ liệu ảo với trạng thái thật
                finalDevicesList = Object.entries(customData).map(([virtualId, info]) => {
                    // Xác định thiết bị ảo này link tới loại thật nào (pump/fan/light)
                    let realType = 'pump';
                    if (info.type === 'fan' || virtualId.includes('fan')) realType = 'fan';
                    else if (info.type === 'light' || virtualId.includes('light')) realType = 'light';

                    // Lấy trạng thái thật
                    const realState = realStateMap[realType] || 'OFF';

                    return {
                        deviceId: virtualId,
                        customName: info.customName,
                        zone: info.zone,
                        type: info.type,
                        gardenId: info.gardenId || 1, // Nếu dữ liệu cũ chưa có gardenId, mặc định là 1
                        state: realState, // <--- QUAN TRỌNG: Dùng trạng thái thật từ backend
                        ...getDeviceTypeInfo(virtualId, info.type)
                    };
                });
            }

            // 3. LỌC THEO VƯỜN HIỆN TẠI
            // Chỉ hiển thị thiết bị thuộc vườn đang chọn
            const filteredDevices = finalDevicesList.filter(d => d.gardenId === currentGardenId);

            setDevices(filteredDevices);
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDevice = async (virtualDeviceId, currentState) => {
        try {
            // Không set loading toàn cục để tránh nháy màn hình, chỉ xử lý nội bộ
            const newState = currentState === 'ON' ? 'OFF' : 'ON';

            // --- 1. OPTIMISTIC UPDATE (Cập nhật UI ngay lập tức - Logic cũ) ---
            setDevices(prev => {
                const clickedDevice = prev.find(d => d.deviceId === virtualDeviceId);
                const targetType = clickedDevice ? clickedDevice.type : 'pump';

                // Cập nhật tất cả thiết bị cùng loại (vì thực tế chúng chung 1 relay)
                return prev.map(d =>
                    d.type === targetType ? { ...d, state: newState } : d
                );
            });

            // --- 2. GỌI API ---
            await deviceAPI.controlDevice(virtualDeviceId, newState);

            // --- 3. ĐỒNG BỘ LẠI (Logic mới) ---
            // Gọi lại fetch để đảm bảo dữ liệu khớp với DB và các client khác
            // Delay nhẹ để backend kịp xử lý
            setTimeout(() => fetchDevices(), 500);

        } catch (error) {
            console.error('Control failed', error);
            // Nếu lỗi, load lại dữ liệu cũ để hoàn tác
            fetchDevices();
        }
    };

    // Cập nhật hàm lưu: Thêm gardenId vào settings
    const saveDeviceSettings = (deviceId, settings) => {
        const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');
        
        // Lưu setting kèm theo ID của vườn hiện tại
        customData[deviceId] = { 
            ...settings, 
            gardenId: currentGardenId 
        };
        
        localStorage.setItem('deviceCustomData', JSON.stringify(customData));
        fetchDevices();
    };

    // Xóa thiết bị
    const deleteDeviceSettings = (deviceId) => {
        const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');
        delete customData[deviceId];
        localStorage.setItem('deviceCustomData', JSON.stringify(customData));
        fetchDevices();
    };

    useEffect(() => {
        fetchDevices();
        
        // Auto refresh mỗi 3s để cập nhật trạng thái nếu bật từ nơi khác
        const interval = setInterval(fetchDevices, 3000); 
        return () => clearInterval(interval);
    }, [currentGardenId]); // Chạy lại khi người dùng đổi vườn (quan trọng)

    return { 
        devices, 
        loading, 
        toggleDevice, 
        saveDeviceSettings, 
        deleteDeviceSettings, 
        refetch: fetchDevices 
    };
};