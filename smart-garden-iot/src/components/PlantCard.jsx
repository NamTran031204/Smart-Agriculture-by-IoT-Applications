import React from 'react';
import { Droplets } from 'lucide-react';

const PlantCard = ({ plant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-all"
    >
      <div className="relative">
        <span className="absolute top-2 left-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
          {plant.waterDays} giờ trước
        </span>
        <img
          src={plant.image}
          alt={plant.name}
          className="w-full h-32 object-cover rounded-xl"
        />
      </div>
      <div className="mt-3">
        <h4 className="font-semibold text-gray-800 text-sm mb-1">{plant.name}</h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-red-500">
            <span className="text-lg">🌡️</span> {plant.temperature}°C
          </span>
          <span className="flex items-center gap-1 text-blue-500">
            <Droplets size={14} /> {plant.humidity}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlantCard;