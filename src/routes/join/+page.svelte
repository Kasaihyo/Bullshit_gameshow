<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { initializeSocket, joinRoom } from '$lib/socket/client';
  import { gameStore } from '$lib/stores/game.svelte';

  let roomCode = $state('');
  let playerName = $state('');
  let loading = $state(false);
  let error = $state('');

  onMount(() => {
    // Get room code from URL if provided
    roomCode = ($page.url.searchParams.get('code') || '').toUpperCase();
    initializeSocket();
  });

  async function handleJoin() {
    if (!roomCode || !playerName) {
      error = 'Please enter both room code and your name';
      return;
    }

    loading = true;
    error = '';

    try {
      // Save player name
      localStorage.setItem('playerName', playerName);

      // Connect socket
      const socket = initializeSocket();

      // Wait for join response
      socket.once('room:state', (state) => {
        gameStore.updateState(state);
        localStorage.setItem('playerId', socket.id);
        goto(`/game/${roomCode}`);
      });

      socket.once('error', (data) => {
        error = data.message;
        loading = false;
      });

      // Join room
      joinRoom(roomCode, playerName);

      // Timeout after 5 seconds
      setTimeout(() => {
        if (loading) {
          error = 'Connection timeout. Please try again.';
          loading = false;
        }
      }, 5000);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to join room';
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-2">Bullsh*t</h1>
    <p class="text-center text-gray-600 mb-8">Party Game</p>

    <form onsubmit={(e) => { e.preventDefault(); handleJoin(); }} class="space-y-6">
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      {/if}

      <div>
        <label for="roomCode" class="block text-sm font-medium text-gray-700 mb-2">
          Room Code
        </label>
        <input
          id="roomCode"
          type="text"
          placeholder="e.g., ABC123"
          bind:value={roomCode}
          oninput={(e) => {
            roomCode = (e.currentTarget.value || '').toUpperCase().slice(0, 6);
          }}
          maxlength="6"
          disabled={loading}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase font-mono text-lg tracking-widest disabled:bg-gray-100"
        />
      </div>

      <div>
        <label for="playerName" class="block text-sm font-medium text-gray-700 mb-2">
          Your Name
        </label>
        <input
          id="playerName"
          type="text"
          placeholder="Enter your name"
          bind:value={playerName}
          disabled={loading}
          maxlength="50"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !roomCode || !playerName}
        class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
      >
        {loading ? 'Joining...' : 'Join Game'}
      </button>
    </form>

    <div class="mt-8 text-center">
      <p class="text-gray-600 text-sm">Don't have a room code?</p>
      <a href="/host" class="text-purple-600 hover:text-purple-700 font-semibold text-sm">
        Create New Game
      </a>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
