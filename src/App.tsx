import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router'; // Imports your Day 3 central router configurations
import Footer from './components/Footer';

export default function App() {
  return (
    /* These Tailwind classes flex flex-col and min-h-screen are crucial.
      They force the page to take up the full height of the viewport, 
      ensuring the footer stays pushed to the absolute bottom even on short pages!
    */
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* Main content area where your views (Customer, Chef, Owner, Login) render */}
      <main className="flex-grow">
        <RouterProvider router={router} />
      </main>

      {/* The live client footer component containing Steve's details */}
      <Footer />
    </div>
  );
}