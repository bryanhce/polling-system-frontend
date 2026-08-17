import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  headers: {
    // Required for browser requests sent through an ngrok free-tier tunnel.
    'ngrok-skip-browser-warning': '1',
  },
});
