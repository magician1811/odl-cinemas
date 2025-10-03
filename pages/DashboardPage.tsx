import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBookings } from '../services/bookingService';
import { downloadTicket } from '../services/ticketService';
import BookingDetailsModal from '../components/BookingDetailsModal';
import { Booking } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const userBookings = getUserBookings(user.id);
      setBookings(userBookings);
      setLoading(false);
    }
  }, [user]);

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

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDownloadTicket = (booking: Booking) => {
    downloadTicket(booking);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-gray-400">Welcome back, {user?.name}! Here are your ticket bookings.</p>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No bookings found</div>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
            <a
              href="/#/theatres"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300"
            >
              Book Your First Ticket
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <img
                        src={booking.movie.posterUrl}
                        alt={booking.movie.title}
                        className="w-16 h-24 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {booking.movie.title}
                        </h3>
                        <p className="text-gray-400 mb-2">{booking.theatre.name}</p>
                        <p className="text-gray-500 text-sm">
                          {booking.theatre.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Showtime</p>
                        <p className="text-white font-medium">{booking.showtime}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Seats</p>
                        <p className="text-white font-medium">{formatSeats(booking.seats)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Total Price</p>
                        <p className="text-white font-medium">₹{booking.totalPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Booking Date</p>
                        <p className="text-white font-medium">{formatDate(booking.bookingTime)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 text-sm"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDownloadTicket(booking)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300 text-sm"
                      >
                        Download Ticket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DashboardPage;
