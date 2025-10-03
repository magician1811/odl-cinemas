import React from 'react';
import { Showtime } from '../types';

interface ShowtimeSelectorProps {
  showtimes: Showtime[];
  selectedShowtime: string | null;
  onShowtimeSelect: (showtime: string) => void;
}

const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({ 
  showtimes, 
  selectedShowtime, 
  onShowtimeSelect 
}) => {
  if (showtimes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No showtimes available for the selected date.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">Select Showtime</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {showtimes.map((showtime) => (
          <button
            key={showtime.time}
            onClick={() => onShowtimeSelect(showtime.time)}
            disabled={!showtime.available}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              !showtime.available
                ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed'
                : selectedShowtime === showtime.time
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">
                {showtime.time}
              </div>
              {!showtime.available && (
                <div className="text-xs text-red-400 mt-1">
                  Sold Out
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedShowtime && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-gray-300 text-sm">
            Selected Showtime: <span className="text-white font-medium">{selectedShowtime}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ShowtimeSelector;
