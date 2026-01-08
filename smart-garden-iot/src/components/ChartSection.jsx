import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { sensorAPI } from '../services/api';
import { format, startOfWeek, addDays, isFuture, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChartSection = () => {
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => 
    addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i)
  );

  useEffect(() => {
    const fetchData = async () => {
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
            setData([]);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
        setData([]);
      }
    };

    fetchData();
  }, [selectedDate]);

  console.log("data", data)
  return (
    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm h-full flex flex-col">
      
      <div className="flex flex-col gap-6 mb-4">
        <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
           Thống kê tuần này
        </h3>
        
        <div className="flex justify-between bg-gray-50 p-2 rounded-2xl">
          {daysOfWeek.map((day, i) => {
            const isSelected = isSameDay(day, selectedDate);
            const isFutureDate = isFuture(day) && !isSameDay(day, new Date());
            
            return (
              <button
                key={i}
                onClick={() => !isFutureDate && setSelectedDate(day)}
                disabled={isFutureDate}
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

      <div className="h-64 lg:h-96 text-xs lg:text-sm mt-6 flex-1">
          {data.length > 0 ? (
              <div className="h-full overflow-auto">
                  <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b-2 border-gray-100 sticky top-0 bg-white">
                      <div className="text-center font-bold text-gray-700">Thời gian</div>
                      <div className="text-center font-bold text-red-500">Nhiệt độ (°C)</div>
                      <div className="text-center font-bold text-blue-500">Độ ẩm (%)</div>
                  </div>

                  <div className="space-y-2">
                      {data.map((item, index) => (
                          <div
                              key={index}
                              className="grid grid-cols-3 gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                              <div className="text-center text-gray-600 font-medium">
                                  {item.time}
                              </div>
                              <div className="text-center">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg">
              🌡️ {item.temp}°C
            </span>
                              </div>
                              <div className="text-center">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-lg">
              💧 {item.humid}%
            </span>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-red-50 p-4 rounded-xl">
                              <div className="text-xs text-gray-500 mb-1">Nhiệt độ trung bình</div>
                              <div className="text-2xl font-bold text-red-600">
                                  {(data.reduce((sum, item) => sum + parseFloat(item.temp), 0) / data.length).toFixed(1)}°C
                              </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-xl">
                              <div className="text-xs text-gray-500 mb-1">Độ ẩm trung bình</div>
                              <div className="text-2xl font-bold text-blue-600">
                                  {(data.reduce((sum, item) => sum + parseFloat(item.humid), 0) / data.length).toFixed(1)}%
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
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