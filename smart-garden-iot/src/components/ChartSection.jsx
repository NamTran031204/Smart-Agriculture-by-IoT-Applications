// src/components/ChartSection.jsx
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sensorAPI } from '../services/api';
import { format, startOfWeek, addDays, isFuture, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChartSection = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Tạo danh sách 7 ngày trong tuần hiện tại (bắt đầu từ Thứ 2)
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => 
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
  );

  useEffect(() => {
    const fetchData = async () => {
      // Nếu là ngày tương lai thì không load data (trừ khi là hôm nay)
      if (isFuture(selectedDate) && !isSameDay(selectedDate, new Date())) {
        setData([]);
        return;
      }

      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).getTime() / 1000;
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).getTime() / 1000;

      try {
        const historyData = await sensorAPI.getHistory(startOfDay, endOfDay);
        if (historyData && historyData.length > 0) {
          const formattedData = historyData.map(item => ({
            time: new Date(item.timestamp * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            temp: item.temp,
            humid: item.humid
          }));
          setData(formattedData);
        } else {
            setData([]); // Xóa data cũ nếu ngày này không có dữ liệu
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
        setData([]);
      }
    };

    fetchData();
  }, [selectedDate]);

  return (
    // Container chính: Xóa margin âm, thêm padding lớn hơn, bo góc to hơn
    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm h-full flex flex-col">
      
      {/* Header & Date Selector */}
      <div className="flex flex-col gap-6 mb-4">
        {/* Tiêu đề to hơn (text-xl) */}
        <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
           Thống kê tuần này
        </h3>
        
        {/* Thanh chọn ngày */}
        <div className="flex justify-between bg-gray-50 p-2 rounded-2xl">
          {daysOfWeek.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isFutureDate = isFuture(day) && !isSameDay(day, new Date());
            
            return (
              <button
                key={i}
                onClick={() => !isFutureDate && setSelectedDate(day)}
                disabled={isFutureDate}
                // Button to hơn trên desktop (lg:w-16 lg:h-20), bo góc lớn hơn
                className={`flex flex-col items-center justify-center 
                  w-12 h-16 lg:w-16 lg:h-20 
                  rounded-xl lg:rounded-2xl 
                  text-xs lg:text-sm 
                  transition-all duration-200
                  ${isSelected 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-105' 
                    : isFutureDate 
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                <span className="font-bold">{format(day, 'EEE', { locale: vi })}</span>
                <span className="text-[10px] lg:text-xs opacity-80">{format(day, 'd/M')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area: Cao hơn hẳn trên desktop (lg:h-96) */}
      <div className="h-64 lg:h-96 text-xs lg:text-sm mt-6 flex-1">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHumid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{fontSize: 12, fill: '#6b7280'}} 
                axisLine={false}
                tickLine={false}
                minTickGap={30} 
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#6b7280'}} 
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                itemStyle={{ fontSize: '14px', fontWeight: 500 }}
              />
              <Area 
                type="monotone" 
                dataKey="temp" 
                stroke="#ef4444" 
                strokeWidth={3}
                fill="url(#colorTemp)" 
                name="Nhiệt độ" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Area 
                type="monotone" 
                dataKey="humid" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorHumid)" 
                name="Độ ẩm" 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
            
            <p className="text-base font-medium">Chưa có dữ liệu cho ngày này</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSection;