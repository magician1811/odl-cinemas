
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <header className="bg-gray-900 bg-opacity-80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold tracking-wider">
          <span className="text-white">ODL</span>
          <span className="font-gold">CINEMAS</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/theatres" className="text-gray-300 hover:text-white transition duration-300">
            Book Tickets
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:text-white transition duration-300">
                  Admin
                </Link>
              )}
              {!isAdmin && (
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition duration-300">
                  My Bookings
                </Link>
              )}
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition duration-300">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
