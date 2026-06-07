import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Column 1: Contact / Owner */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Contact & Management</h3>
          <p className="text-sm text-gray-400">Owner: <span className="text-white font-medium">Steve Haddadin</span></p>
          <p className="text-sm text-gray-400 mt-1">
            Phone:{' '}
            <a href="tel:+18036161856" className="text-amber-500 hover:underline transition">
              +1 (803) 616-1856
            </a>
          </p>
        </div>

        {/* Column 2: Kitchen Hours */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Kitchen Hours</h3>
          <p className="text-sm text-gray-400">Mon - Sat: <span className="text-white">11:00 AM - 10:00 PM</span></p>
          <p className="text-sm text-gray-400 mt-1">Sunday: <span className="text-white">12:00 PM - 9:00 PM</span></p>
        </div>

        {/* Column 3: Branding */}
        <div className="md:text-right">
          <h3 className="text-white font-semibold text-lg mb-3">Olive Coast</h3>
          <p className="text-xs text-gray-500 max-w-xs md:ml-auto">
            Freshly prepared meals delivered straight to your table or counter. Clean, fast, and secure checkout.
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
        <p>&copy; {currentYear} All Rights Reserved.</p>
        <p className="mt-2 sm:mt-0">
          Powered by <span className="text-gray-400 font-medium">Masaar360</span>
        </p>
      </div>
    </footer>
  );
}