import React from 'react';

interface DateSelectorProps {
  availableDates: string[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  availableDates,
  selectedDate,
  onDateSelect,
}) => {
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

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4 text-center">Select Date</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {availableDates
          .filter((dateStr) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dateObj = new Date(dateStr);
            dateObj.setHours(0, 0, 0, 0);
            return dateObj >= today;
          })
          .map((date) => {
            const isSelected = selectedDate === date;
            
            return (
              <button
                key={date}
                onClick={() => onDateSelect(date)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-600 text-white'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700'
                }`}
              >
                {formatDate(date)}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default DateSelector;