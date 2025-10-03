import jsPDF from 'jspdf';
import { Booking } from '../types';

export const downloadTicket = (booking: Booking): void => {
  const doc = new jsPDF();
  
  // Set up the document
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ODL CINEMAS', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Movie Ticket', 105, 30, { align: 'center' });
  
  // Add a line
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Booking ID
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking ID:', 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.id, 60, 50);
  
  // Movie details
  doc.setFont('helvetica', 'bold');
  doc.text('Movie:', 20, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.movie.title, 60, 65);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Theatre:', 20, 80);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.theatre.name, 60, 80);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Location:', 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.theatre.location, 60, 95);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Showtime:', 20, 110);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.showtime, 60, 110);
  
  // Seats
  doc.setFont('helvetica', 'bold');
  doc.text('Seats:', 20, 125);
  doc.setFont('helvetica', 'normal');
  const seatNumbers = booking.seats.map(seat => `${seat.row}${seat.number}`).join(', ');
  doc.text(seatNumbers, 60, 125);
  
  // Price
  doc.setFont('helvetica', 'bold');
  doc.text('Total Price:', 20, 140);
  doc.setFont('helvetica', 'normal');
  doc.text(`₹${booking.totalPrice}`, 60, 140);
  
  // Booking date
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Date:', 20, 155);
  doc.setFont('helvetica', 'normal');
  const bookingDate = new Date(booking.bookingTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(bookingDate, 60, 155);
  
  // Add a footer line
  doc.setLineWidth(0.5);
  doc.line(20, 170, 190, 170);
  
  doc.setFontSize(10);
  doc.text('Thank you for choosing ODL Cinemas!', 105, 180, { align: 'center' });
  doc.text('Enjoy your movie!', 105, 190, { align: 'center' });
  
  // Save the PDF
  doc.save(`ticket-${booking.id}.pdf`);
};
