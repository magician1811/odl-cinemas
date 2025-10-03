import { Booking, Seat } from '../types';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

export const generateTicketPDF = async (booking: Booking): Promise<void> => {
  const TICKET_WIDTH = 85;
  const TICKET_HEIGHT = 180;
  const MARGIN = 5;
  const STUB_HEIGHT = 50;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [TICKET_HEIGHT, TICKET_WIDTH],
  });

  // --- Background ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, TICKET_WIDTH, TICKET_HEIGHT, 'F');

  // --- Side Borders ---
  doc.setFillColor(220, 0, 0);
  doc.rect(0, 0, 3, TICKET_HEIGHT, 'F'); // Left border
  doc.rect(TICKET_WIDTH - 3, 0, 3, TICKET_HEIGHT, 'F'); // Right border

  // --- Header ---
  doc.setFillColor(220, 0, 0);
  doc.rect(3, 0, TICKET_WIDTH - 6, 18, 'F'); // Header bar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('ODL CINEMAS', TICKET_WIDTH / 2, 12, { align: 'center' });

  // --- Movie Poster ---
  try {
    const imgData = await fetch(booking.movie.posterUrl)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      );
    doc.addImage(imgData, 'JPEG', MARGIN + 3, 20, TICKET_WIDTH - 2 * MARGIN - 6, 60);
  } catch (err) {
    console.error('Poster error:', err);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Poster Not Available', TICKET_WIDTH / 2, 50, { align: 'center' });
  }

  // --- Movie Info ---
  let currentY = 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(booking.movie.title.toUpperCase(), TICKET_WIDTH / 2, currentY, { align: 'center' });

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  const movieDetails = `${booking.movie.genre} | ${booking.movie.duration} | ${booking.movie.censorRating}`;
  doc.text(movieDetails, TICKET_WIDTH / 2, currentY, { align: 'center' });

  // --- Booking Details ---
  currentY += 10;
  const detailLabel = (label: string, value: string, isBold: boolean = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(label, MARGIN + 3, currentY);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 11 : 9);
    doc.setTextColor(0, 0, 0);
    doc.text(value, MARGIN + 30, currentY, { maxWidth: TICKET_WIDTH - MARGIN * 2 - 30 });
    currentY += 6;
  };

  detailLabel('Date:', new Date(booking.date).toLocaleDateString());
  detailLabel('Time:', booking.showtime);
  const seatString = booking.seats.map((s: Seat) => s.id).join(', ');
  detailLabel('Seats:', seatString, true);
  const seatTypes = booking.seats.map((s: Seat) => s.type).join(', ');
  detailLabel('Type:', seatTypes, true);

  // --- Price ---
  const totalPrice = booking.seats.reduce((sum, s: Seat) => sum + s.price, 0);
  detailLabel('Total Price:', `₹${totalPrice}`, true);

  // --- Perforated Line ---
  const perforatedY = TICKET_HEIGHT - STUB_HEIGHT;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(MARGIN + 3, perforatedY, TICKET_WIDTH - MARGIN - 3, perforatedY);
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(120);
  doc.text('Tear here', TICKET_WIDTH / 2, perforatedY - 2, { align: 'center' });

  // --- Stub Info ---
  let stubY = perforatedY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('ODL CINEMAS', TICKET_WIDTH / 2, stubY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(booking.movie.title, TICKET_WIDTH / 2, stubY + 6, { align: 'center', maxWidth: TICKET_WIDTH - MARGIN * 2 });
  doc.text(`${new Date(booking.bookingTime).toLocaleDateString()} | ${booking.showtime}`, TICKET_WIDTH / 2, stubY + 11, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(seatString, TICKET_WIDTH / 2, stubY + 16, { align: 'center' });

  // --- QR Code on Stub ---
  try {
    const qrCodeData = JSON.stringify({
      bookingId: booking.id,
      movie: booking.movie.title,
      showtime: booking.showtime,
      seats: seatString,
    });

    const QR_SIZE = 25; // Smaller QR code to fit stub
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData, { errorCorrectionLevel: 'H', width: 256, margin: 1 });
    const qrX = (TICKET_WIDTH - QR_SIZE) / 2;
    const qrY = stubY + 18; // fits stub height
    doc.addImage(qrCodeUrl, 'PNG', qrX, qrY, QR_SIZE, QR_SIZE);
  } catch (err) {
    console.error('QR generation error:', err);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 0, 0);
    doc.text('QR Error', TICKET_WIDTH / 2, stubY + 33, { align: 'center' });
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text('Customer Copy', TICKET_WIDTH / 2, stubY + 50, { align: 'center' });

  // --- Save PDF ---
  doc.save(`ODL-Ticket-${booking.movie.title.replace(/\s+/g, '-')}-${booking.id.substring(0, 4)}.pdf`);
};
