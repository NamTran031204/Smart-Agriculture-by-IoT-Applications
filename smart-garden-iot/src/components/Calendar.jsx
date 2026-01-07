import React from 'react';
import { DAYS_OF_WEEK } from '../utils/constants';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const dates = [28, 29, 30, 1, 2, 3, 4];
  const activeDates = [1, 3, 4]; // Dates with watering schedule

  return (
    <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">2 Tháng 10, 2025</h3>
        <button className="text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center">
        {DAYS_OF_WEEK.map((day, i) => (
          <div key={i} className="text-xs text-gray-500 font-medium">
            {day}
          </div>
        ))}
        {dates.map((date, i) => {
          const isSelected = date === selectedDate;
          const isActive = activeDates.includes(date);
          const isPastMonth = date > 20;
          
          return (
            <button
              key={i}
              onClick={() => onDateSelect && onDateSelect(date)}
              className={`py-2 text-sm transition-colors ${
                isSelected
                  ? 'bg-green-600 text-white rounded-full font-bold'
                  : isActive
                  ? 'text-gray-800 font-medium hover:bg-gray-100 rounded-full'
                  : isPastMonth
                  ? 'text-gray-400'
                  : 'text-gray-400 hover:bg-gray-50 rounded-full'
              }`}
            >
              {date}
              {isActive && !isSelected && (
                <div className="text-xs text-green-600 leading-none">•</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;