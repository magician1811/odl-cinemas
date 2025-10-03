
import MovieDetailsPage from './pages/MovieDetailsPage';

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import TheatresPage from './pages/TheatresPage';
import MoviesPage from './pages/MoviesPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PaymentPage from './pages/PaymentPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BookingProvider>
        <HashRouter>
          <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/theatres" element={<TheatresPage />} />
                <Route path="/theatres/:theatreId" element={<MoviesPage />} />
                <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
                <Route path="/seats/:theatreId/:movieId/:date/:showtime" element={<SeatSelectionPage />} />
                <Route path="/payment" element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/confirmation" element={
                  <ProtectedRoute>
                    <ConfirmationPage />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </BookingProvider>
    </AuthProvider>
  );
};

export default App;
