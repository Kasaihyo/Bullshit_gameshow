import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '$lib/types/game';

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function initializeSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (socket && socket.connected) {
    return socket;
  }

  // In production, use the same host. In development, use localhost:3001
  let socketUrl = 'http://localhost:3001';

  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      // In production, connect to the same origin (Railway app)
      socketUrl = window.location.origin;
    } else if (import.meta.env.VITE_SOCKET_URL) {
      socketUrl = import.meta.env.VITE_SOCKET_URL;
    }
  }

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('✅ Connected to game server');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from game server');
  });

  socket.on('error', (data) => {
    console.error('Socket error:', data.message);
  });

  return socket;
}

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Event emitters
export function joinRoom(roomCode: string, playerName: string): void {
  const s = getSocket();
  if (s) {
    s.emit('player:join', { roomCode, playerName });
  }
}

export function lockAnswer(choice: number): void {
  const s = getSocket();
  if (s) {
    s.emit('answer:lock', { choice });
  }
}

export function submitVote(vote: 'believe' | 'bullshit'): void {
  const s = getSocket();
  if (s) {
    s.emit('vote:submit', { vote });
  }
}

export function startGame(): void {
  const s = getSocket();
  if (s) {
    s.emit('host:start');
  }
}

export function pauseGame(): void {
  const s = getSocket();
  if (s) {
    s.emit('host:pause');
  }
}

export function resumeGame(): void {
  const s = getSocket();
  if (s) {
    s.emit('host:resume');
  }
}

export function skipQuestion(): void {
  const s = getSocket();
  if (s) {
    s.emit('host:skip');
  }
}

export function kickPlayer(playerId: string): void {
  const s = getSocket();
  if (s) {
    s.emit('host:kick', { playerId });
  }
}
