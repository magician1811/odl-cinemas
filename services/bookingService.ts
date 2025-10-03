
import { Booking } from '../types';
import { getBookings, addBooking as addBookingToBlob } from './azureBlobService';

const BOOKINGS_KEY = 'odl-cinema-bookings';

// Fallback to localStorage if Azure Blob Storage fails
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    // Try to get bookings from Azure Blob Storage
    const blobBookings = await getBookings();
    return blobBookings;
  } catch (error) {
    console.error("Failed to get bookings from Azure Blob Storage, falling back to localStorage", error);
    
    // Fallback to localStorage
    try {
      const bookingsJson = localStorage.getItem(BOOKINGS_KEY);
      return bookingsJson ? JSON.parse(bookingsJson) : [];
    } catch (localError) {
      console.error("Failed to parse bookings from localStorage", localError);
      return [];
    }
  }
};

export const saveBooking = async (newBooking: Booking): Promise<void> => {
  try {
    // Save to Azure Blob Storage
    await addBookingToBlob(newBooking);
    
    // Also save to localStorage as backup
    const localBookings = localStorage.getItem(BOOKINGS_KEY);
    const allBookings = localBookings ? JSON.parse(localBookings) : [];
    allBookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));
  } catch (error) {
    console.error("Failed to save booking to Azure Blob Storage", error);
    
    // Fallback to just localStorage
    const localBookings = localStorage.getItem(BOOKINGS_KEY);
    const allBookings = localBookings ? JSON.parse(localBookings) : [];
    allBookings.push(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(allBookings));
  }
};

export const getBookedSeatsForShow = async (theatreId: string, movieId: string, date: string, showtime: string): Promise<Set<string>> => {
  const allBookings = await getAllBookings();
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

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const allBookings = await getAllBookings();
  return allBookings.filter(booking => booking.userId === userId);
};

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  const allBookings = await getAllBookings();
  return allBookings.find(booking => booking.id === bookingId) || null;
};
