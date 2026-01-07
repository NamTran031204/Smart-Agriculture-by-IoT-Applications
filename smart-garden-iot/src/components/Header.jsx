import React from 'react';
import { Menu, Bell, RefreshCw, Settings } from 'lucide-react';

const Header = ({ onRefresh, onSettingsOpen, loading }) => {
  return (
    <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
      <div className="flex items-center gap-3">
        <button className="bg-white text-green-600 p-2 rounded-lg">
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-lg">Smart Garden IoT</h1>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-green-700 rounded-lg transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
        <button 
          onClick={onSettingsOpen}
          className="p-2 hover:bg-green-700 rounded-lg transition-colors"
        >
          <Settings size={20} />
        </button>
        <button className="relative p-2">
          <Bell size={20} />
          <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};

export default Header;