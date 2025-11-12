import type { GameState, Player, Question } from '$lib/types/game';

export class GameStore {
  roomCode = $state<string>('');
  phase = $state<string>('LOBBY');
  players = $state<Player[]>([]);
  currentQuestion = $state<Question | undefined>();
  hotSeatPlayerId = $state<string>('');
  hotSeatAnswer = $state<number | undefined>();
  isAnswerCorrect = $state<boolean | undefined>();
  currentRound = $state<number>(0);
  ladder = $state<Array<{ playerId: string; playerName: string; score: number }>>([]);
  advanced = $state<string[]>([]);
  eliminated = $state<string[]>([]);
  timer = $state<number>(0);
  connected = $state<boolean>(false);
  error = $state<string>('');

  // Derived state
  get myPlayerId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('playerId');
  }

  get hotSeatPlayer(): Player | undefined {
    return this.players.find((p) => p.id === this.hotSeatPlayerId);
  }

  get otherPlayers(): Player[] {
    return this.players.filter((p) => p.id !== this.myPlayerId);
  }

  get playerCount(): number {
    return this.players.length;
  }

  get isHost(): boolean {
    const myId = this.myPlayerId;
    return myId ? this.players.some((p) => p.id === myId && p.role === 'host') : false;
  }

  get isHotSeat(): boolean {
    const myId = this.myPlayerId;
    return myId ? this.hotSeatPlayerId === myId : false;
  }

  get isJudge(): boolean {
    const myId = this.myPlayerId;
    return myId ? this.players.some((p) => p.id === myId && p.role === 'judge') : false;
  }

  // State mutations
  updateState(newState: Partial<GameState>): void {
    if (newState.roomCode !== undefined) this.roomCode = newState.roomCode;
    if (newState.phase !== undefined) this.phase = newState.phase as string;
    if (newState.players !== undefined) this.players = newState.players;
    if (newState.currentQuestion !== undefined) this.currentQuestion = newState.currentQuestion;
    if (newState.hotSeatPlayerId !== undefined) this.hotSeatPlayerId = newState.hotSeatPlayerId;
    if (newState.currentRound !== undefined) this.currentRound = newState.currentRound;
    if (newState.ladder !== undefined) this.ladder = newState.ladder;
    if (newState.advanced !== undefined) this.advanced = newState.advanced;
    if (newState.eliminated !== undefined) this.eliminated = newState.eliminated;
  }

  updatePlayers(players: Player[]): void {
    this.players = players;
  }

  addPlayer(player: Player): void {
    const existing = this.players.find((p) => p.id === player.id);
    if (!existing) {
      this.players.push(player);
    }
  }

  updateQuestion(question: Question): void {
    this.currentQuestion = question;
  }

  setHotSeat(playerId: string): void {
    this.hotSeatPlayerId = playerId;
  }

  setAnswer(choice: number, correct: boolean): void {
    this.hotSeatAnswer = choice;
    this.isAnswerCorrect = correct;
  }

  setPhase(phase: string): void {
    this.phase = phase;
  }

  setTimer(time: number): void {
    this.timer = time;
  }

  setConnected(connected: boolean): void {
    this.connected = connected;
  }

  setError(message: string): void {
    this.error = message;
  }

  clearError(): void {
    this.error = '';
  }

  reset(): void {
    this.roomCode = '';
    this.phase = 'LOBBY';
    this.players = [];
    this.currentQuestion = undefined;
    this.hotSeatPlayerId = '';
    this.hotSeatAnswer = undefined;
    this.isAnswerCorrect = undefined;
    this.currentRound = 0;
    this.ladder = [];
    this.advanced = [];
    this.eliminated = [];
    this.timer = 0;
    this.connected = false;
    this.error = '';
  }
}

// Global store instance
export const gameStore = new GameStore();
