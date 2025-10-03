
import React from 'react';
import { Link } from 'react-router-dom';
import { THEATRES } from '../constants';

const TheatresPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center tracking-wide font-gold">Select a Theatre</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {THEATRES.map((theatre) => (
          <Link
            key={theatre.id}
            to={`/theatres/${theatre.id}`}
            className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300 transform hover:-translate-y-1 group"
          >
            <div className="overflow-hidden h-48">
              <img src={theatre.imageUrl} alt={theatre.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{theatre.name}</h2>
              <p className="text-gray-400">{theatre.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TheatresPage;