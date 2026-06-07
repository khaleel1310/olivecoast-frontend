import axios from 'axios';

export const api = axios.create({
  // Checks for Vercel's cloud variable first; falls back to local port if missing
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: This allows browser cookies (JWT auth) to pass back and forth automatically
  withCredentials: true, 
});