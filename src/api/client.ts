import axios from 'axios';

export const api = axios.create({
  // Points directly to your active backend server port
  baseURL: 'http://localhost:4000/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: This allows browser cookies (JWT auth) to pass back and forth automatically
  withCredentials: true, 
});