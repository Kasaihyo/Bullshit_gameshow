<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { initializeSocket, getSocket, startGame } from '$lib/socket/client';
  import { gameStore } from '$lib/stores/game.svelte';
  import LobbyScreen from '$lib/components/screens/LobbyScreen.svelte';
  import QuestionScreen from '$lib/components/screens/QuestionScreen.svelte';
  import StoryScreen from '$lib/components/screens/StoryScreen.svelte';
  import VoteScreen from '$lib/components/screens/VoteScreen.svelte';
  import RevealScreen from '$lib/components/screens/RevealScreen.svelte';
  import LadderScreen from '$lib/components/screens/LadderScreen.svelte';
  import type { GameState } from '$lib/types/game';

  let roomCode = $page.params.code.toUpperCase();

  onMount(() => {
    const socket = initializeSocket();

    // Listen for room state updates
    socket.on('room:state', (state: GameState) => {
      gameStore.updateState(state);
    });

    socket.on('player:joined', (data) => {
      gameStore.addPlayer(data.player);
    });

    socket.on('game:started', (data) => {
      gameStore.setPhase('QUESTION');
      gameStore.updateQuestion(data.question);
      gameStore.setHotSeat(data.hotSeatPlayerId);
    });

    socket.on('question:show', (data) => {
      gameStore.setPhase('QUESTION');
      gameStore.updateQuestion(data.question);
      gameStore.setTimer(data.timer);
    });

    socket.on('private:reveal', (data) => {
      gameStore.setPhase('PRIVATE_REVEAL');
      gameStore.setAnswer(gameStore.hotSeatAnswer || 0, data.correct);
    });

    socket.on('story:phase', (data) => {
      gameStore.setPhase('STORY');
      gameStore.setTimer(data.timer);
    });

    socket.on('vote:phase', (data) => {
      gameStore.setPhase('VOTE');
      gameStore.setTimer(data.timer);
    });

    socket.on('reveal:public', (data) => {
      gameStore.setPhase('REVEAL');
      gameStore.updateState({
        isAnswerCorrect: data.correct,
        advanced: data.advanced,
        eliminated: data.eliminated
      });
    });

    socket.on('error', (data) => {
      gameStore.setError(data.message);
    });

    return () => {
      socket.off('room:state');
      socket.off('player:joined');
      socket.off('game:started');
      socket.off('question:show');
      socket.off('private:reveal');
      socket.off('story:phase');
      socket.off('vote:phase');
      socket.off('reveal:public');
      socket.off('error');
    };
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-4">
  <!-- Error Banner -->
  {#if gameStore.error}
    <div class="fixed top-4 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg z-50">
      {gameStore.error}
      <button
        onclick={() => gameStore.clearError()}
        class="ml-4 text-xs hover:opacity-80"
      >
        ✕
      </button>
    </div>
  {/if}

  <!-- Connection Status -->
  <div class="fixed top-4 right-4 flex items-center gap-2">
    <div class={`w-2 h-2 rounded-full ${gameStore.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
    <span class="text-xs">{gameStore.connected ? 'Connected' : 'Disconnected'}</span>
  </div>

  <!-- Player Count & Room Code -->
  <div class="flex justify-between items-center mb-4">
    <div class="text-sm opacity-75">
      Room: <span class="font-mono font-bold text-lg">{roomCode}</span>
    </div>
    <div class="text-sm opacity-75">
      Players: <span class="font-bold">{gameStore.playerCount}</span>
    </div>
  </div>

  <!-- Main Game Screen -->
  <div class="max-w-6xl mx-auto">
    {#if gameStore.phase === 'LOBBY'}
      <LobbyScreen {roomCode} />
    {:else if gameStore.phase === 'QUESTION'}
      <QuestionScreen />
    {:else if gameStore.phase === 'PRIVATE_REVEAL' || gameStore.phase === 'STORY'}
      <StoryScreen />
    {:else if gameStore.phase === 'VOTE'}
      <VoteScreen />
    {:else if gameStore.phase === 'REVEAL'}
      <RevealScreen />
    {:else if gameStore.phase === 'LADDER'}
      <LadderScreen />
    {:else}
      <div class="text-center py-20">
        <p class="text-2xl">Loading game...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
</style>
