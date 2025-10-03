import React from 'react';
import { downloadTicket } from '../services/ticketService';
import { Booking } from '../types';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSeats = (seats: any[]) => {
    return seats.map(seat => `${seat.row}${seat.number}`).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Booking Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Movie Information */}
            <div className="flex items-start space-x-4">
              <img
                src={booking.movie.posterUrl}
                alt={booking.movie.title}
                className="w-24 h-36 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{booking.movie.title}</h3>
                <p className="text-gray-400 mb-1">Genre: {booking.movie.genre}</p>
                <p className="text-gray-400 mb-1">Duration: {booking.movie.duration}</p>
                <p className="text-gray-400 mb-1">Rating: {booking.movie.censorRating}</p>
              </div>
            </div>

            {/* Theatre Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Theatre Information</h4>
              <p className="text-gray-300 mb-1">Theatre: {booking.theatre.name}</p>
              <p className="text-gray-300 mb-1">Location: {booking.theatre.location}</p>
              <p className="text-gray-300">Showtime: {booking.showtime}</p>
            </div>

            {/* Seat Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Seat Information</h4>
              <p className="text-gray-300 mb-1">Seats: {formatSeats(booking.seats)}</p>
              <p className="text-gray-300 mb-1">Total Seats: {booking.seats.length}</p>
              <div className="mt-2">
                {booking.seats.map((seat, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2 mb-1"
                  >
                    {seat.row}{seat.number} ({seat.type})
                  </span>
                ))}
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Booking Information</h4>
              <p className="text-gray-300 mb-1">Booking ID: {booking.id}</p>
              <p className="text-gray-300 mb-1">Booking Date: {formatDate(booking.bookingTime)}</p>
              <p className="text-gray-300 mb-1">Total Price: ₹{booking.totalPrice}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => downloadTicket(booking)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Download Ticket
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
