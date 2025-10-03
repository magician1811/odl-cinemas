import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="text-center">
      <div 
        className="relative min-h-[60vh] flex items-center justify-center rounded-lg overflow-hidden bg-cover bg-center p-8"
        style={{ backgroundImage: 'url(Gemini_Generated_Image_93jeff93jeff93je.png)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Your Ultimate Movie Experience
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-300">
            Discover the latest blockbusters, choose your perfect seat, and immerse yourself in the magic of cinema.
          </p>
          <Link
            to="/theatres"
            className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-lg py-3 px-10 rounded-full transition-transform duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/50"
          >
            Book Your Tickets Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;