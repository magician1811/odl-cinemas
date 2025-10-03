import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { THEATRES, generateSeats, SEAT_LAYOUT } from '../constants';
// fix: Correctly import 'Seat' as it is a default export.
import SeatComponent from '../components/Seat';
import { SeatStatus, Seat as SeatType } from '../types';
import { getBookedSeatsForShow } from '../services/bookingService';
import { getMovies } from '../services/azureBlobService';

const SeatSelectionPage: React.FC = () => {
  const { theatreId, movieId, date: encodedDate, showtime: encodedShowtime } = useParams<{ 
    theatreId: string; 
    movieId: string; 
    date: string;
    showtime: string 
  }>();
  const date = decodeURIComponent(encodedDate || '');
  const showtime = decodeURIComponent(encodedShowtime || '');
  const navigate = useNavigate();
  const { setBookingDetails, toggleSeat, selectedSeats, totalPrice, theatre, movie } = useBooking();

  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const allSeats = useMemo(() => generateSeats(), []);

  useEffect(() => {
    if (theatreId && movieId && date && showtime) {
      const currentTheatre = THEATRES.find((t) => t.id === theatreId);
      let currentMovie = currentTheatre?.movies.find((m) => m.id === movieId);
      const fetchAndSetMovie = async () => {
        if (!currentMovie) {
          // Fetch movie details from Azure Blob Storage
          const movies = await getMovies();
          currentMovie = movies.find((m) => m.id === movieId);
        }
        if (currentMovie) {
          if (currentTheatre && currentMovie) {
            setBookingDetails(currentTheatre, currentMovie, date, showtime);
            const booked = await getBookedSeatsForShow(
              theatreId,
              movieId,
              date,
              showtime
            );
            setBookedSeats(booked);
          }
        }
      };
      fetchAndSetMovie();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theatreId, movieId, date, showtime]);

  if (!theatre || !movie) {
    return <div className="text-center">Loading booking details...</div>;
  }
  
  const handleProceed = () => {
    if(selectedSeats.length > 0) {
      navigate('/payment');
    }
  }

  const getSeatStatus = (seat: SeatType): SeatStatus => {
    if (bookedSeats.has(seat.id)) return SeatStatus.BOOKED;
    if (selectedSeats.some(s => s.id === seat.id)) return SeatStatus.SELECTED;
    return SeatStatus.AVAILABLE;
  };

  const renderSeats = () => {
    const grid = [];
    let seatIndex = 0;
    for (let i = 0; i < SEAT_LAYOUT.rows; i++) {
        const rowElements: React.ReactNode[] = [];
        for (let j = 0; j < SEAT_LAYOUT.cols; j++) {
            const seat = allSeats[seatIndex++];
            if (seat) {
                rowElements.push(
                    <SeatComponent
                        key={seat.id}
                        seat={seat}
                        status={getSeatStatus(seat)}
                        onToggle={toggleSeat}
                    />
                );
            }
        }

        // Insert gaps from right-to-left to avoid shifting indices
        rowElements.splice(SEAT_LAYOUT.cols - SEAT_LAYOUT.gapAfterCol, 0, <div key={`gap-${i}-2`} className="w-6 md:w-8" />);
        rowElements.splice(SEAT_LAYOUT.gapAfterCol, 0, <div key={`gap-${i}-1`} className="w-6 md:w-8" />);
        
        grid.push(<div key={`row-${i}`} className={`flex justify-center gap-2 ${i === SEAT_LAYOUT.gapAfterRow - 1 ? 'mb-4' : ''}`}>{rowElements}</div>);
    }
    return grid;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow">
        <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
        <p className="text-gray-400 mb-6">{theatre.name} - {showtime}</p>
        
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex flex-col items-center">
             <div className="flex flex-col gap-2">
                {renderSeats()}
            </div>
            <div className="mt-4 flex flex-col items-center w-full">
                <span className="text-sm text-gray-400 mb-1 tracking-widest">SCREEN</span>
                <div className="w-full h-1 bg-gray-500 rounded-md"></div>
             </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm bg-gray-600"></div><span>Available</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm bg-cyan-400"></div><span>Selected</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm bg-gray-800"></div><span>Booked</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm bg-gray-600 border-b-2 border-gold"></div><span>Premium</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm border-2 border-yellow-400"></div><span>VIP</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm border-2 border-green-400"></div><span>Wheelchair</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-t-sm border-l-4 border-r-4 border-gray-400"></div><span>Aisle</span></div>
        </div>
      </div>
      
      <div className="w-full lg:w-80 flex-shrink-0 bg-gray-800/50 p-6 rounded-lg self-start">
        <h2 className="text-2xl font-bold border-b border-gray-600 pb-3 mb-4">Booking Summary</h2>
        {selectedSeats.length === 0 ? (
          <p className="text-gray-400">Select your seats to continue.</p>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Selected Seats:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(s => <span key={s.id} className="bg-cyan-500 text-black font-bold text-sm px-3 py-1 rounded">{s.id}</span>)}
              </div>
            </div>
            <div className="text-2xl font-bold flex justify-between items-center mt-6 pt-4 border-t border-gray-600">
              <span>Total:</span>
              <span>₹{totalPrice}</span>
            </div>
             <button
              onClick={handleProceed}
              disabled={selectedSeats.length === 0}
              className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition duration-300"
            >
              Proceed to Payment
            </button>
          </>
        )}
      </div>
      

    </div>
  );
};

export default SeatSelectionPage;