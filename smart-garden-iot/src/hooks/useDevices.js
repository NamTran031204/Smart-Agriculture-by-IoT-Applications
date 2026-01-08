import { useState, useEffect } from 'react';
import { deviceAPI } from '../services/api';

export const useDevices = (currentGardenId) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deviceState, setDeviceState] = useState(false)

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

            const backendDevices = await deviceAPI.getAllDevices();

            const realStateMap = {};
            backendDevices.forEach(d => {
                realStateMap[d.deviceId] = d.state;
            });

            const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');

            let finalDevicesList = [];

            if (Object.keys(customData).length === 0) {
                finalDevicesList = backendDevices.map(d => ({
                    ...d,
                    customName: d.deviceId,
                    zone: 'Hệ thống gốc',
                    type: d.deviceId.includes('fan') ? 'fan' : d.deviceId.includes('light') ? 'light' : 'pump',
                    gardenId: 1,
                    ...getDeviceTypeInfo(d.deviceId)
                }));
            } else {
                finalDevicesList = Object.entries(customData).map(([virtualId, info]) => {
                    let realType = 'pump';
                    if (info.type === 'fan' || virtualId.includes('fan')) realType = 'fan';
                    else if (info.type === 'light' || virtualId.includes('light')) realType = 'light';

                    const realState = realStateMap[realType] || 'OFF';

                    return {
                        deviceId: virtualId,
                        customName: info.customName,
                        zone: info.zone,
                        type: info.type,
                        gardenId: info.gardenId || 1,
                        state: realState,
                        ...getDeviceTypeInfo(virtualId, info.type)
                    };
                });
            }

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
            const newState = deviceState ? 'OFF' : 'ON';

            setDevices(prev => {
                const clickedDevice = prev.find(d => d.deviceId === virtualDeviceId);
                const targetType = clickedDevice ? clickedDevice.type : 'pump';

                return prev.map(d =>
                    d.type === targetType ? { ...d, state: newState } : d
                );
            });

            await deviceAPI.controlDevice(virtualDeviceId, newState);
            setDeviceState(!deviceState);

            setTimeout(() => fetchDevices(), 15000);

        } catch (error) {
            console.error('Control failed', error);
            fetchDevices();
        }
    };

    const saveDeviceSettings = (deviceId, settings) => {
        const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');
        
        customData[deviceId] = { 
            ...settings, 
            gardenId: currentGardenId 
        };
        
        localStorage.setItem('deviceCustomData', JSON.stringify(customData));
        fetchDevices();
    };

    const deleteDeviceSettings = (deviceId) => {
        const customData = JSON.parse(localStorage.getItem('deviceCustomData') || '{}');
        delete customData[deviceId];
        localStorage.setItem('deviceCustomData', JSON.stringify(customData));
        fetchDevices();
    };

    useEffect(() => {
        fetchDevices();
        
        const interval = setInterval(fetchDevices, 3000); 
        return () => clearInterval(interval);
    }, [currentGardenId]);

    return { 
        devices, 
        loading, 
        toggleDevice, 
        saveDeviceSettings, 
        deleteDeviceSettings, 
        refetch: fetchDevices 
    };
};