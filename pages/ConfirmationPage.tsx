
import React from 'react';
import { useBooking } from '../hooks/useBooking';
import { generateTicketPDF } from '../components/TicketPDFGenerator';
import { Link } from 'react-router-dom';

const ConfirmationPage: React.FC = () => {
  const { completedBooking, clearBooking } = useBooking();

  if (!completedBooking) {
    return (
      <div className="text-center">
        <p className="text-xl">No booking confirmed yet.</p>
        <Link to="/" className="text-cyan-400 hover:underline mt-4 inline-block">Go to Home</Link>
      </div>
    );
  }

  const handleDownload = () => {
    generateTicketPDF(completedBooking);
  };
  
  const handleNewBooking = () => {
    clearBooking();
  }

  return (
    <div className="max-w-3xl mx-auto text-center">
      <svg className="w-24 h-24 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h1 className="text-4xl font-bold mt-4 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-400 mb-8">Your ticket has been booked successfully. A confirmation has been sent to your email.</p>

      <div className="bg-gray-800 text-left rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-3 font-gold">Your Ticket</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p className="text-sm text-gray-400">MOVIE</p>
                <p className="text-lg font-semibold">{completedBooking.movie.title}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">THEATRE</p>
                <p className="text-lg font-semibold">{completedBooking.theatre.name}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">SHOWTIME</p>
                <p className="text-lg font-semibold">{new Date(completedBooking.date).toLocaleDateString()} - {completedBooking.showtime}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400">SEATS</p>
                <p className="text-lg font-semibold">{completedBooking.seats.map(s => s.id).join(', ')}</p>
            </div>
             <div className="md:col-span-2">
                <p className="text-sm text-gray-400">BOOKING ID</p>
                <p className="text-lg font-semibold font-mono">{completedBooking.id}</p>
            </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleDownload}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Download Ticket (PDF)
        </button>
        <Link 
          to="/theatres" 
          onClick={handleNewBooking}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
        >
          Book Another Ticket
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;
