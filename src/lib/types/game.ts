// Game phase types
export type GamePhase =
  | 'LOBBY'
  | 'ROLE_ASSIGN'
  | 'QUESTION'
  | 'PRIVATE_REVEAL'
  | 'STORY'
  | 'VOTE'
  | 'REVEAL'
  | 'LADDER_UPDATE'
  | 'ELIMINATION'
  | 'GAME_END';

// Player roles
export type PlayerRole = 'host' | 'judge' | 'hotseat';

// Vote types
export type VoteChoice = 'believe' | 'bullshit';

// Player data structure
export interface Player {
  id: string;
  roomId: string;
  name: string;
  role: PlayerRole;
  score: number;
  ladder: number;
  connected: boolean;
}

// Question structure
export interface Question {
  id: string;
  category: string;
  difficulty: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

// Game state
export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  currentRound: number;
  hotSeatPlayerId?: string;
  currentQuestion?: Question;
  hotSeatAnswer?: number;
  isAnswerCorrect?: boolean;
  votes: Map<string, VoteChoice>;
  voteResults?: {
    playerId: string;
    vote: VoteChoice;
    correctRead: boolean;
  }[];
  ladder: number;
  advanced: boolean;
  eliminated: boolean;
  timers: {
    [key: string]: number;
  };
}

// Socket.io event types
export interface ServerToClientEvents {
  'room:created': (data: { roomCode: string }) => void;
  'player:joined': (data: { player: Player }) => void;
  'room:state': (data: GameState) => void;
  'game:started': (data: { question: Question; hotSeatPlayerId: string }) => void;
  'question:show': (data: { question: Question; timer: number }) => void;
  'private:reveal': (data: { correct: boolean }) => void;
  'story:phase': (data: { timer: number }) => void;
  'vote:phase': (data: { timer: number }) => void;
  'reveal:public': (data: {
    correct: boolean;
    hotSeatAnswer: number;
    voteResults: Array<{ playerId: string; vote: VoteChoice; correctRead: boolean }>;
    advanced: boolean;
    eliminated: boolean;
  }) => void;
  'ladder:update': (data: { ladder: number; advanced: boolean }) => void;
  'player:eliminated': (data: { playerId: string; message: string }) => void;
  'game:ended': (data: { winner: string }) => void;
  'timer:tick': (data: { remaining: number }) => void;
  'error': (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  'player:join': (data: { roomCode: string; playerName: string }) => void;
  'player:ready': () => void;
  'answer:lock': (data: { choice: number }) => void;
  'vote:submit': (data: { vote: VoteChoice }) => void;
  'host:start': () => void;
  'host:pause': () => void;
  'host:resume': () => void;
  'host:skip': () => void;
  'host:kick': (data: { playerId: string }) => void;
}

// Room data
export interface Room {
  id: string;
  code: string;
  hostId: string;
  status: 'LOBBY' | 'ACTIVE' | 'FINISHED';
  createdAt: Date;
  players: Player[];
}
