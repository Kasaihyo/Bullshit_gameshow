import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import type { ClientToServerEvents, ServerToClientEvents, GameState, Player, Question } from './src/lib/types/game';

// Import SvelteKit handler
import { handler } from './.svelte-kit/output/server/index.js';

const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Determine CORS origin based on environment
let CORS_ORIGIN = 'http://localhost:5173';
if (NODE_ENV === 'production') {
  // In production on Railway, allow all origins from the same host
  CORS_ORIGIN = '*';
} else if (process.env.VITE_APP_URL) {
  CORS_ORIGIN = process.env.VITE_APP_URL;
}

// Create HTTP server with SvelteKit handler
const httpServer = createServer(handler);

// Initialize Socket.io
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// In-memory game state (for MVP, can migrate to Redis)
const gameRooms = new Map<string, GameState>();
const playerSessions = new Map<string, { roomCode: string; playerId: string }>();

// ==================== UTILITY FUNCTIONS ====================

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase().slice(0, 6);
}

async function getRandomQuestion(): Promise<Question | null> {
  const question = await prisma.question.findFirst({
    orderBy: {
      id: 'asc'
    },
    skip: Math.floor(Math.random() * 100) // Rough randomization
  });

  if (!question) return null;

  return {
    id: question.id,
    category: question.category,
    difficulty: question.difficulty,
    question: question.question,
    options: JSON.parse(question.options),
    correct: question.correct,
    explanation: question.explanation || undefined
  };
}

async function createRoom(hostId: string, hostName: string): Promise<string> {
  const code = generateRoomCode();

  // Create room in database
  const room = await prisma.room.create({
    data: {
      code,
      hostId,
      status: 'LOBBY'
    }
  });

  // Create host player
  await prisma.player.create({
    data: {
      id: hostId,
      roomId: room.id,
      name: hostName,
      role: 'host'
    }
  });

  // Initialize game state
  gameRooms.set(code, {
    roomCode: code,
    phase: 'LOBBY',
    players: [
      {
        id: hostId,
        roomId: room.id,
        name: hostName,
        role: 'host',
        score: 0,
        ladder: 0,
        connected: true
      }
    ],
    currentRound: 0,
    votes: new Map(),
    ladder: 0,
    advanced: false,
    eliminated: false,
    timers: {}
  });

  return code;
}

// ==================== SOCKET.IO HANDLERS ====================

io.on('connection', (socket) => {
  console.log(`🔗 Player connected: ${socket.id}`);

  // Handle room creation
  socket.on('player:join', async (data) => {
    try {
      const { roomCode, playerName } = data;
      const playerId = socket.id; // Use socket ID as player ID for MVP

      // Check if room exists in memory
      let gameState = gameRooms.get(roomCode);

      if (!gameState) {
        // Try to load from database
        const room = await prisma.room.findUnique({
          where: { code: roomCode },
          include: { players: true }
        });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Recreate game state in memory
        gameState = {
          roomCode,
          phase: 'LOBBY',
          players: room.players as unknown as Player[],
          currentRound: 0,
          votes: new Map(),
          ladder: 0,
          advanced: false,
          eliminated: false,
          timers: {}
        };

        gameRooms.set(roomCode, gameState);
      }

      // Add player to game state
      const newPlayer: Player = {
        id: playerId,
        roomId: (gameState.players[0]?.roomId) || '',
        name: playerName,
        role: 'judge',
        score: 0,
        ladder: 0,
        connected: true
      };

      gameState.players.push(newPlayer);
      playerSessions.set(playerId, { roomCode, playerId });

      // Join socket to room
      socket.join(roomCode);

      // Persist to database
      const room = await prisma.room.findFirst({
        where: { code: roomCode }
      });

      if (room) {
        await prisma.player.create({
          data: {
            id: playerId,
            roomId: room.id,
            name: playerName,
            role: 'judge'
          }
        });
      }

      // Broadcast to room
      io.to(roomCode).emit('player:joined', { player: newPlayer });
      io.to(roomCode).emit('room:state', gameState);

      console.log(`✅ Player joined room ${roomCode}: ${playerName}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle game start
  socket.on('host:start', async () => {
    try {
      const session = playerSessions.get(socket.id);
      if (!session) return;

      const gameState = gameRooms.get(session.roomCode);
      if (!gameState || gameState.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }

      // Transition to first question
      gameState.phase = 'QUESTION';
      gameState.currentRound++;

      const question = await getRandomQuestion();
      if (!question) {
        socket.emit('error', { message: 'No questions available' });
        return;
      }

      gameState.currentQuestion = question;

      // Select random hot-seat player
      const randomIndex = Math.floor(Math.random() * gameState.players.length);
      const hotSeatPlayer = gameState.players[randomIndex];
      gameState.hotSeatPlayerId = hotSeatPlayer.id;
      hotSeatPlayer.role = 'hotseat';

      // Broadcast game started
      io.to(session.roomCode).emit('game:started', {
        question,
        hotSeatPlayerId: hotSeatPlayer.id
      });

      console.log(`🎮 Game started in room ${session.roomCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  // Handle answer lock (hot-seat only)
  socket.on('answer:lock', async (data) => {
    try {
      const session = playerSessions.get(socket.id);
      if (!session) return;

      const gameState = gameRooms.get(session.roomCode);
      if (!gameState || gameState.phase !== 'QUESTION') return;

      const { choice } = data;
      gameState.hotSeatAnswer = choice;

      // Check if correct
      const isCorrect = choice === gameState.currentQuestion?.correct;
      gameState.isAnswerCorrect = isCorrect;

      // Send private reveal to hot-seat only
      io.to(socket.id).emit('private:reveal', { correct: isCorrect });

      // Transition to story phase
      gameState.phase = 'STORY';
      gameState.timers['story'] = 45;

      // Broadcast to all
      io.to(session.roomCode).emit('story:phase', { timer: 45 });

      console.log(
        `📝 Player answered in room ${session.roomCode}: ${isCorrect ? 'CORRECT' : 'WRONG'}`
      );

      // Auto-transition to vote after story timer
      setTimeout(() => {
        gameState!.phase = 'VOTE';
        gameState!.timers['vote'] = 15;

        // Reset votes map
        gameState!.votes.clear();

        io.to(session.roomCode).emit('vote:phase', { timer: 15 });
      }, 45000);
    } catch (error) {
      console.error('Error locking answer:', error);
      socket.emit('error', { message: 'Failed to lock answer' });
    }
  });

  // Handle vote submission
  socket.on('vote:submit', async (data) => {
    try {
      const session = playerSessions.get(socket.id);
      if (!session) return;

      const gameState = gameRooms.get(session.roomCode);
      if (!gameState || gameState.phase !== 'VOTE') return;

      const { vote } = data;
      gameState.votes.set(socket.id, vote);

      // Check if all judges have voted
      const judgeCount = gameState.players.filter((p) => p.role === 'judge').length;
      const voteCount = gameState.votes.size;

      if (voteCount === judgeCount) {
        // All voted, show reveal
        gameState.phase = 'REVEAL';

        // Calculate vote results
        const voteResults = Array.from(gameState.votes.entries()).map(([playerId, vote]) => {
          const correctRead = gameState.isAnswerCorrect
            ? vote === 'believe'
            : vote === 'bullshit';
          return {
            playerId,
            vote,
            correctRead
          };
        });

        io.to(session.roomCode).emit('reveal:public', {
          correct: gameState.isAnswerCorrect || false,
          hotSeatAnswer: gameState.hotSeatAnswer || 0,
          voteResults,
          advanced: gameState.advanced,
          eliminated: false
        });

        console.log(`🎯 Votes revealed in room ${session.roomCode}`);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      socket.emit('error', { message: 'Failed to submit vote' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const session = playerSessions.get(socket.id);
    if (session) {
      const gameState = gameRooms.get(session.roomCode);
      if (gameState) {
        const player = gameState.players.find((p) => p.id === socket.id);
        if (player) {
          player.connected = false;
        }
      }
      playerSessions.delete(socket.id);
    }
    console.log(`❌ Player disconnected: ${socket.id}`);
  });
});

// ==================== SERVER START ====================

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on http://localhost:${PORT}`);
  console.log(`📡 CORS origin: ${CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
