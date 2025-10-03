
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking';
import { useAuth } from '../context/AuthContext';
import { saveBooking } from '../services/bookingService';
import { Booking, Coupon } from '../types';
import { validateCoupon, markCouponUsed } from '../services/couponService';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { theatre, movie, date, showtime, selectedSeats, totalPrice, setCompletedBooking } = useBooking();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  // New: support multiple payment methods
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!theatre || !movie || !showtime || selectedSeats.length === 0) {
    return (
      <div className="text-center">
        <p className="text-red-500">Booking information is incomplete. Please start over.</p>
      </div>
    );
  }

  const calculateDiscountedTotal = () => {
    if (!appliedCoupon) return totalPrice;
    if (appliedCoupon.discountType === 'flat') {
      return Math.max(totalPrice - appliedCoupon.amount, 0);
    }
    if (appliedCoupon.discountType === 'percent') {
      return Math.round(totalPrice * (1 - appliedCoupon.amount / 100));
    }
    return totalPrice;
  };

  const discountedTotal = calculateDiscountedTotal();

  const handleApplyCoupon = () => {
    const coupon = validateCoupon(couponCode.trim());
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError(null);
    } else {
      setCouponError('Invalid or expired coupon code');
      setAppliedCoupon(null);
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const newBooking: Booking = {
      id: `ODL-${Date.now()}`,
      userId: user?.id || '',
      theatre,
      movie,
      date: date || '', // Always use the selected date
      showtime,
      seats: selectedSeats,
      totalPrice: discountedTotal,
      bookingTime: new Date().toISOString(),
    };

    // Simulate payment processing delay
    setTimeout(() => {
      saveBooking(newBooking);
      if (appliedCoupon) markCouponUsed(appliedCoupon.code);
      setCompletedBooking(newBooking);
      navigate('/confirmation');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center font-gold">Payment Details</h1>

      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        {/* Booking summary */}
        <div className="border-b border-gray-700 pb-4 mb-6">
          <h2 className="text-xl font-semibold">{movie.title}</h2>
          <p className="text-gray-400">{theatre.name} | {showtime}</p>
          <p className="text-gray-300 mt-2">Seats: {selectedSeats.map(s => s.id).join(', ')}</p>
        </div>

        <div className="mb-6">
          <label htmlFor="coupon" className="block text-sm font-medium text-gray-300 mb-1">Have a coupon?</label>
          <div className="flex gap-2">
            <input
              id="coupon"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Enter code"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-sm font-semibold"
            >Apply</button>
          </div>
          {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
          {appliedCoupon && <p className="text-green-400 text-sm mt-1">Applied {appliedCoupon.code} ✓</p>}
        </div>

        <div className="text-3xl font-bold text-center mb-8">
          Total Amount: <span className="text-cyan-400">₹{discountedTotal}</span>
        </div>

        {/* Payment form */}
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Payment method selector */}
          <div>
            <p className="text-sm font-medium text-gray-300 mb-2">Select Payment Method</p>
            <div className="flex gap-3">
              {[{ key: 'card', label: 'Card' }, { key: 'upi', label: 'UPI' }, { key: 'netbanking', label: 'NetBanking' }].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key as 'card' | 'upi' | 'netbanking')}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${paymentMethod === key ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Card payment fields */}
          {paymentMethod === 'card' && (
            <>
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-300">Name on Card</label>
                <input type="text" id="cardName" defaultValue="John Doe" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300">Card Number</label>
                <input type="text" id="cardNumber" defaultValue="4242 4242 4242 4242" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-300">Expiry (MM/YY)</label>
                  <input type="text" id="expiry" defaultValue="12/28" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
                </div>
                <div className="flex-1">
                  <label htmlFor="cvc" className="block text-sm font-medium text-gray-300">CVC</label>
                  <input type="text" id="cvc" defaultValue="123" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
                </div>
              </div>
            </>
          )}

          {/* UPI payment fields */}
          {paymentMethod === 'upi' && (
            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-300">UPI ID</label>
              <input type="text" id="upiId" placeholder="example@bank" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
          )}

          {/* NetBanking fields */}
          {paymentMethod === 'netbanking' && (
            <div>
              <label htmlFor="bank" className="block text-sm font-medium text-gray-300">Select Bank</label>
              <select id="bank" className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" required>
                <option value="">--Choose Bank--</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="AXIS">Axis Bank</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : `Pay ₹${totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
