
import React from 'react';
import { Seat as SeatType, SeatStatus } from '../types';

interface SeatProps {
  seat: SeatType;
  status: SeatStatus;
  onToggle: (seat: SeatType) => void;
}

const Seat: React.FC<SeatProps> = ({ seat, status, onToggle }) => {
  const getSeatClasses = () => {
    let classes = 'w-6 h-6 md:w-8 md:h-8 rounded-t-md flex justify-center items-center font-bold text-xs transition duration-300 ease-in-out transform';

    switch (seat.type) {
      case 'premium':
        classes += ' border-b-2 border-gold';
        break;
      case 'vip':
        classes += ' border-2 border-yellow-400';
        break;
      case 'wheelchair':
        classes += ' border-2 border-green-400';
        break;
      case 'aisle':
        classes += ' border-l-4 border-r-4 border-gray-400';
        break;
    }

    switch (status) {
      case SeatStatus.AVAILABLE:
        classes += ' bg-gray-600 hover:bg-cyan-500 hover:scale-110 cursor-pointer';
        break;
      case SeatStatus.SELECTED:
        classes += ' bg-cyan-400 text-black scale-110 shadow-lg shadow-cyan-400/50 cursor-pointer';
        break;
      case SeatStatus.BOOKED:
        classes += ' bg-gray-800 cursor-not-allowed';
        break;
    }
    return classes;
  };

  const handleClick = () => {
    if (status !== SeatStatus.BOOKED) {
      onToggle(seat);
    }
  };

  return (
    <div className={getSeatClasses()} onClick={handleClick}>
    </div>
  );
};

export default Seat;
