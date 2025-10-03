import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Theatre, Movie, Seat, Booking } from '../types';
import { getBookedSeatsForShow } from '../services/bookingService';

interface BookingContextType {
  theatre: Theatre | null;
  movie: Movie | null;
  date: string | null;
  showtime: string | null;
  selectedSeats: Seat[];
  bookedSeats: Set<string>;
  totalPrice: number;
  loading: boolean;
  setBookingDetails: (theatre: Theatre, movie: Movie, date: string, showtime: string) => void;
  toggleSeat: (seat: Seat) => void;
  clearBooking: () => void;
  setCompletedBooking: (booking: Booking | null) => void;
  completedBooking: Booking | null;
  refreshBookedSeats: () => Promise<void>;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [showtime, setShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const newTotalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    setTotalPrice(newTotalPrice);
  }, [selectedSeats]);

  // Fetch booked seats whenever booking details change
  useEffect(() => {
    if (theatre && movie && date && showtime) {
      refreshBookedSeats();
    }
  }, [theatre, movie, date, showtime]);

  const refreshBookedSeats = async (): Promise<void> => {
    if (!theatre || !movie || !date || !showtime) return;
    
    setLoading(true);
    try {
      const seats = await getBookedSeatsForShow(theatre.id, movie.id, date, showtime);
      setBookedSeats(seats);
    } catch (error) {
      console.error('Error fetching booked seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const setBookingDetails = (theatre: Theatre, movie: Movie, date: string, showtime: string) => {
    setTheatre(theatre);
    setMovie(movie);
    setDate(date);
    setShowtime(showtime);
    setSelectedSeats([]);
  };

  const toggleSeat = (seat: Seat) => {
    // Don't allow selecting already booked seats
    if (bookedSeats.has(seat.id)) return;
    
    setSelectedSeats((prevSeats) => {
      const isSelected = prevSeats.some((s) => s.id === seat.id);
      if (isSelected) {
        return prevSeats.filter((s) => s.id !== seat.id);
      } else {
        return [...prevSeats, seat];
      }
    });
  };

  const clearBooking = () => {
    setTheatre(null);
    setMovie(null);
    setDate(null);
    setShowtime(null);
    setSelectedSeats([]);
    setBookedSeats(new Set());
    setTotalPrice(0);
    setCompletedBooking(null);
  };

  return (
    <BookingContext.Provider
      value={{
        theatre,
        movie,
        date,
        showtime,
        selectedSeats,
        bookedSeats,
        totalPrice,
        loading,
        setBookingDetails,
        toggleSeat,
        clearBooking,
        completedBooking,
        setCompletedBooking,
        refreshBookedSeats,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};