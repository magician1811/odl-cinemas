
import { Booking } from '../types';
import { getBookings, addBooking as addBookingToBlob } from './azureBlobService';

const BOOKINGS_KEY = 'odl-cinema-bookings';

// Fetch all bookings exclusively from Azure Blob Storage. LocalStorage fallback removed to ensure centralized data.
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const blobBookings = await getBookings();
    return blobBookings;
  } catch (error) {
    console.error("Failed to get bookings from Azure Blob Storage", error);
    throw new Error('Unable to fetch bookings. Please check your network or configuration.');
  }
};

export const saveBooking = async (newBooking: Booking): Promise<void> => {
  try {
    await addBookingToBlob(newBooking);
  } catch (error) {
    console.error("Failed to save booking to Azure Blob Storage", error);
    throw new Error('Unable to save booking. Please try again later.');
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
