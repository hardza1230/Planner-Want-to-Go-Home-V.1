import React from 'react';
import { AVAILABLE_ICONS } from '../constants';

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">เลือกไอคอน</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-1">
            {AVAILABLE_ICONS.map(icon => (
                <button 
                    key={icon}
                    onClick={() => onSelect(icon)}
                    className="aspect-square flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 text-gray-600 hover:text-primary transition-colors"
                >
                    <i className={`fas ${icon} fa-lg`}></i>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};