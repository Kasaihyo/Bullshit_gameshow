<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { initializeSocket } from '$lib/socket/client';
  import { gameStore } from '$lib/stores/game.svelte';

  let loading = $state(false);
  let error = $state('');

  onMount(() => {
    initializeSocket();
  });

  async function createRoom() {
    loading = true;
    error = '';

    try {
      const socket = initializeSocket();

      // Listen for room creation response
      socket.once('room:created', (data) => {
        localStorage.setItem('roomCode', data.roomCode);
        localStorage.setItem('isHost', 'true');
        goto(`/game/${data.roomCode}`);
      });

      socket.once('error', (data) => {
        error = data.message;
        loading = false;
      });

      // Request room creation
      socket.emit('host:create');

      // Timeout after 5 seconds
      setTimeout(() => {
        if (loading) {
          error = 'Failed to create room. Please try again.';
          loading = false;
        }
      }, 5000);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create room';
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Bullsh*t</h1>
      <p class="text-gray-600">Create a Game Room</p>
    </div>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {error}
      </div>
    {/if}

    <div class="space-y-4 mb-8">
      <div class="bg-purple-50 rounded-lg p-6 text-center">
        <p class="text-gray-700 mb-2">You'll be the host and can:</p>
        <ul class="text-left text-sm text-gray-600 space-y-2">
          <li>✓ Start the game when everyone's ready</li>
          <li>✓ Control the game flow</li>
          <li>✓ See all players' answers</li>
        </ul>
      </div>
    </div>

    <button
      onclick={createRoom}
      disabled={loading}
      class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
    >
      {loading ? 'Creating room...' : 'Create Game Room'}
    </button>

    <div class="mt-8 text-center">
      <p class="text-gray-600 text-sm">Already have a code?</p>
      <a href="/join" class="text-purple-600 hover:text-purple-700 font-semibold text-sm">
        Join Existing Game
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
