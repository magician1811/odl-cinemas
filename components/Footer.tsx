
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} ODL Cinemas. All rights reserved.</p>
        <p className="text-sm mt-1">Experience the magic of cinema.</p>
      </div>
    </footer>
  );
};

export default Footer;
