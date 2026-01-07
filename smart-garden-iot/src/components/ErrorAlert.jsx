import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
      <p className="text-sm text-red-600 flex-1">{error}</p>
      <button 
        onClick={onClose} 
        className="ml-auto text-red-600 hover:text-red-800 flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ErrorAlert;