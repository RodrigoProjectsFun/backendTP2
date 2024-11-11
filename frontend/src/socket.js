// socket.js
import { io } from 'socket.io-client';

const socket = io('/', {
  withCredentials: true,
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

export default socket;
