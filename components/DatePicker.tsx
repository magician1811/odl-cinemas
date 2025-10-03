import React from 'react';
import { MovieDate } from '../types';

interface DatePickerProps {
  dates: MovieDate[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ dates, selectedDate, onDateSelect }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">Select Date</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {dates.map((movieDate) => (
          <button
            key={movieDate.date}
            onClick={() => onDateSelect(movieDate.date)}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              selectedDate === movieDate.date
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">
                {formatDate(movieDate.date)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {movieDate.showtimes.length} shows
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {selectedDate && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-300 text-sm">
            Selected: <span className="text-white font-medium">{formatFullDate(selectedDate)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
