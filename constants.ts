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
        synopsis: 'Parthi, a mild-mannered cafe owner in Himachal, is forced to confront his violent past when a ruthless smuggler believes Parthi stole his contraband. What follows is a bloody game of cat and mouse.',
        trailerUrl: 'https://www.youtube.com/embed/Po3jStA673E',
      },
      {
        id: 'movie-vikram',
        title: 'Vikram',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/Vikram_2022_poster.jpg',
        genre: 'Action/Thriller',
        duration: '2h 55m',
        censorRating: 'U/A',
        dates: generateMovieDates(['11:00 AM', '02:45 PM', '06:30 PM', '10:15 PM']),
        synopsis: 'A black-ops squad led by Agent Amar investigates a series of masked vigilante killings that lead them into a deadly game against a powerful drug syndicate headed by Sandhanam.',
        trailerUrl: 'https://www.youtube.com/embed/OKNXr0F-ye8',
      },
       {
        id: 'movie-jailer',
        title: 'Jailer',
        posterUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Jailer_2023_Tamil_film_poster.jpg',
        genre: 'Action/Comedy',
        duration: '2h 48m',
        censorRating: 'U/A',
        dates: generateMovieDates(['09:30 AM', '01:00 PM', '04:30 PM', '08:00 PM']),
        synopsis: 'Muthuvel Pandian, a retired jailer living peacefully with his family, is pulled back into violence when a ruthless gang kidnaps his son.',
        trailerUrl: 'https://www.youtube.com/embed/ekb3mWm07Kk',
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
        synopsis: 'In the 10th century, warrior prince Vandiyathevan journeys across the Chola kingdom to deliver a warning of civil war while conspiracies threaten the throne.',
        trailerUrl: 'https://www.youtube.com/embed/6L6XqWoS8tw',
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
        synopsis: 'Alcoholic professor JD is assigned to a juvenile school where he confronts Bhavani, a gangster who uses the children for his criminal activities.',
        trailerUrl: 'https://www.youtube.com/embed/UT3eHuHnsZ0',
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
      let seatType: SeatType;
      if (premiumRows.includes(i)) {
        seatType = SeatType.PREMIUM;
      } else if (i === 0 && (j === 0 || j === cols - 1)) {
        // Very first row corners could be VIP recliners
        seatType = SeatType.VIP;
      } else if (j === 0 || j === cols - 1) {
        // Seats at extreme ends can be aisle seats (easy exit)
        seatType = SeatType.AISLE;
      } else if (i === rows - 1 && (j === 0 || j === 1)) {
        // Last row first two seats reserved for wheelchair users
        seatType = SeatType.WHEELCHAIR;
      } else {
        seatType = SeatType.STANDARD;
      }

      const basePrice = seatType === SeatType.PREMIUM ? SEAT_PRICE.premium : SEAT_PRICE.standard;
      const priceMultiplier = seatType === SeatType.VIP ? 2 : seatType === SeatType.WHEELCHAIR ? 0.8 : 1;

      seats.push({
        id: `${rowChar}${j + 1}`,
        row: rowChar,
        number: j + 1,
        type: seatType,
        price: Math.round(basePrice * priceMultiplier),
      });
    }
  }
  return seats;
};