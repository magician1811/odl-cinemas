
import { Booking } from '../types';

const BOOKINGS_KEY = 'odl-cinema-bookings';

export const getAllBookings = (): Booking[] => {
  try {
    const bookingsJson = localStorage.getItem(BOOKINGS_KEY);
    return bookingsJson ? JSON.parse(bookingsJson) : [];
  } catch (error) {
    console.error("Failed to parse bookings from localStorage", error);
    return [];
  }
};

export const saveBooking = (newBooking: Booking): void => {
  const allBookings = getAllBookings();
  allBookings.push(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));
};

export const getBookedSeatsForShow = (theatreId: string, movieId: string, date: string, showtime: string): Set<string> => {
  const allBookings = getAllBookings();
  const bookedSeats = new Set<string>();
  
  allBookings
    .filter(
      (booking) =>
        booking.theatre.id === theatreId &&
        booking.movie.id === movieId &&
        booking.date === date &&
        booking.showtime === showtime
    )
    .forEach((booking) => {
      booking.seats.forEach((seat) => {
        bookedSeats.add(seat.id);
      });
    });

  return bookedSeats;
};

export const getUserBookings = (userId: string): Booking[] => {
  const allBookings = getAllBookings();
  return allBookings.filter(booking => booking.userId === userId);
};

export const getBookingById = (bookingId: string): Booking | null => {
  const allBookings = getAllBookings();
  return allBookings.find(booking => booking.id === bookingId) || null;
};
