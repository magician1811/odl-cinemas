export interface Showtime {
  time: string; // e.g., "10:00 AM"
  available: boolean;
}

export interface MovieDate {
  date: string; // ISO date string
  showtimes: Showtime[];
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  genre: string;
  duration: string; // e.g., "2h 30m"
  censorRating: string; // e.g., "U", "U/A", "A"
  dates: MovieDate[]; // Available dates with showtimes
}

export interface Theatre {
  id: string;
  name: string;
  location: string;
  movies: Movie[];
  imageUrl: string;
}

export enum SeatStatus {
  AVAILABLE = 'available',
  SELECTED = 'selected',
  BOOKED = 'booked',
}

export enum SeatType {
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export interface Seat {
  id: string; // e.g., "A1", "C12"
  row: string;
  number: number;
  type: SeatType;
  price: number;
}

export interface Booking {
  id: string;
  userId: string; // User who made the booking
  theatre: Theatre;
  movie: Movie;
  date: string; // Selected date
  showtime: string;
  seats: Seat[];
  totalPrice: number;
  bookingTime: string; // ISO string
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string; // ISO string
}

export interface AuthUser {
  user: User;
  token: string;
}

// New type for movie reviews
export interface Review {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO
}