import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Theatre, Movie, Seat, Booking } from '../types';

interface BookingContextType {
  theatre: Theatre | null;
  movie: Movie | null;
  date: string | null;
  showtime: string | null;
  selectedSeats: Seat[];
  totalPrice: number;
  setBookingDetails: (theatre: Theatre, movie: Movie, date: string, showtime: string) => void;
  toggleSeat: (seat: Seat) => void;
  clearBooking: () => void;
  setCompletedBooking: (booking: Booking | null) => void;
  completedBooking: Booking | null;
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theatre, setTheatre] = useState<Theatre | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [showtime, setShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const newTotalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    setTotalPrice(newTotalPrice);
  }, [selectedSeats]);

  const setBookingDetails = (theatre: Theatre, movie: Movie, date: string, showtime: string) => {
    setTheatre(theatre);
    setMovie(movie);
    setDate(date);
    setShowtime(showtime);
    setSelectedSeats([]);
  };

  const toggleSeat = (seat: Seat) => {
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
        totalPrice,
        setBookingDetails,
        toggleSeat,
        clearBooking,
        completedBooking,
        setCompletedBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};