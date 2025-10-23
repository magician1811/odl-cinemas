
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../services/bookingService';
import { Booking } from '../types';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { theatre, movie, date, showtime, selectedSeats, totalPrice, setCompletedBooking } = useBooking();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!theatre || !movie || !showtime || selectedSeats.length === 0) {
    return (
      <div className="text-center">
        <p className="text-red-500">Booking information is incomplete. Please start over.</p>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const newBooking: Booking = {
      id: `ODL-${Date.now()}`,
      userId: user?.id || '',
      theatre,
      movie,
      date: date || '', // Always use the selected date
      showtime,
      seats: selectedSeats,
      totalPrice,
      bookingTime: new Date().toISOString(),
    };

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save booking to Azure
      await saveBooking(newBooking);
      console.log('Booking saved successfully:', newBooking);
      
      setCompletedBooking(newBooking);
      navigate('/confirmation');
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center font-gold">Payment Details</h1>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="border-b border-gray-700 pb-4 mb-6">
            <h2 className="text-xl font-semibold">{movie.title}</h2>
            <p className="text-gray-400">{theatre.name} | {showtime}</p>
            <p className="text-gray-300 mt-2">Seats: {selectedSeats.map(s => s.id).join(', ')}</p>
        </div>
        <div className="text-3xl font-bold text-center mb-8">
            Total Amount: <span className="text-cyan-400">₹{totalPrice}</span>
        </div>

        <form onSubmit={handlePayment}>
          <div className="space-y-4">
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-300">Name on Card</label>
              <input type="text" id="cardName" defaultValue="John Doe" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300">Card Number</label>
              <input type="text" id="cardNumber" defaultValue="4242 4242 4242 4242" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-300">Expiry (MM/YY)</label>
                <input type="text" id="expiry" defaultValue="12/28" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
              <div className="flex-1">
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-300">CVC</label>
                <input type="text" id="cvc" defaultValue="123" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isProcessing}
            className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
              </>
            ) : `Pay ₹${totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
