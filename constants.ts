import { Theatre, Seat, SeatType, MovieDate, Showtime } from './types';

// Helper function to generate dates and showtimes
const generateMovieDates = (showtimes: string[]): MovieDate[] => {
  const dates: MovieDate[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    
    const movieShowtimes: Showtime[] = showtimes.map(time => ({
      time,
      available: true // All showtimes are available
    }));
    
    dates.push({
      date: dateString,
      showtimes: movieShowtimes
    });
  }
  
  return dates;
};

export const THEATRES: Theatre[] = [
  {
    id: 'odl-velachery',
    name: 'ODL Cinemas, Velachery',
    location: 'Phoenix Marketcity, Chennai',
    imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/ce/03/44/luxe-spi-cinemas.jpg?w=900&h=500&s=1',
    movies: [
      {
        id: 'movie-leo',
        title: 'Leo',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/7/75/Leo_%282023_Indian_film%29.jpg',
        genre: 'Action/Thriller',
        duration: '2h 44m',
        censorRating: 'U/A',
        dates: generateMovieDates(['10:00 AM', '01:30 PM', '05:00 PM', '09:30 PM']),
      },
      {
        id: 'movie-vikram',
        title: 'Vikram',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg',
        genre: 'Action/Thriller',
        duration: '2h 55m',
        censorRating: 'U/A',
        dates: generateMovieDates(['11:00 AM', '02:45 PM', '06:30 PM', '10:15 PM']),
      },
       {
        id: 'movie-jailer',
        title: 'Jailer',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg',
        genre: 'Action/Comedy',
        duration: '2h 48m',
        censorRating: 'U/A',
        dates: generateMovieDates(['09:30 AM', '01:00 PM', '04:30 PM', '08:00 PM']),
      }
    ],
  },
  {
    id: 'odl-anna-nagar',
    name: 'ODL Cinemas, Anna Nagar',
    location: 'VR Mall, Chennai',
    imageUrl: 'https://vrchennai.com/UploadFile/storeImageGallery/PVR-pic-1.jpg',
    movies: [
      {
        id: 'movie-ponniyin-selvan',
        title: 'Ponniyin Selvan: I',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Ponniyin_Selvan_I.jpg',
        genre: 'Historical/Drama',
        duration: '2h 47m',
        censorRating: 'U',
        dates: generateMovieDates(['10:30 AM', '02:15 PM', '06:00 PM', '09:45 PM']),
      },
       {
        id: 'movie-vikram',
        title: 'Vikram',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg',
        genre: 'Action/Thriller',
        duration: '2h 55m',
        censorRating: 'U/A',
        dates: generateMovieDates(['09:45 AM', '01:15 PM', '05:00 PM', '08:45 PM']),
      },
      {
        id: 'movie-master',
        title: 'Master',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/53/Master_2021_poster.jpg',
        genre: 'Action/Drama',
        duration: '2h 59m',
        censorRating: 'U/A',
        dates: generateMovieDates(['11:15 AM', '03:00 PM', '07:00 PM', '10:30 PM']),
      },
    ],
  },
];

const SEAT_PRICE = {
  standard: 150,
  premium: 250,
};

export const SEAT_LAYOUT = {
  rows: 10,
  cols: 12,
  gapAfterCol: 3,
  gapAfterRow: 4,
  premiumRows: [0, 1], // First 2 rows are premium
};

export const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const { rows, cols, premiumRows } = SEAT_LAYOUT;
  for (let i = 0; i < rows; i++) {
    const rowChar = String.fromCharCode(65 + i); // A, B, C...
    for (let j = 0; j < cols; j++) {
      const seatType = premiumRows.includes(i) ? SeatType.PREMIUM : SeatType.STANDARD;
      seats.push({
        id: `${rowChar}${j + 1}`,
        row: rowChar,
        number: j + 1,
        type: seatType,
        price: seatType === SeatType.PREMIUM ? SEAT_PRICE.premium : SEAT_PRICE.standard,
      });
    }
  }
  return seats;
};