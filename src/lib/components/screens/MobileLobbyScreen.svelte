<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';
</script>

<div class="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-4">
  <!-- Header -->
  <div class="text-center pt-4 pb-6">
    <h1 class="text-2xl font-bold mb-2">Bullsh*t</h1>
    <p class="text-lg opacity-75 mb-4">Room Code</p>
    <div class="bg-white/10 backdrop-blur rounded-lg px-6 py-4 mb-4">
      <p class="text-4xl font-mono font-bold tracking-widest">{gameStore.roomCode}</p>
    </div>
    <p class="text-sm opacity-75">Share this code with friends</p>
  </div>

  <!-- Players Count -->
  <div class="text-center mb-4">
    <p class="text-sm opacity-75">Players in Room</p>
    <p class="text-3xl font-bold">{gameStore.playerCount}</p>
  </div>

  <!-- Players List -->
  <div class="flex-1 overflow-y-auto mb-6">
    <div class="space-y-2">
      {#each gameStore.players as player (player.id)}
        <div class="bg-white/10 backdrop-blur rounded-lg px-4 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
            <span class="font-semibold truncate">{player.name}</span>
          </div>
          {#if player.role === 'host'}
            <span class="text-xs bg-purple-500 px-2 py-1 rounded whitespace-nowrap ml-2">HOST</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Status Text -->
  <div class="text-center mb-4">
    {#if gameStore.isHost}
      <p class="text-sm opacity-75 mb-3">You are the host</p>
      <p class="text-sm opacity-60">
        {gameStore.playerCount < 2 ? `Waiting for ${2 - gameStore.playerCount} more player(s)...` : 'Ready to start!'}
      </p>
    {:else}
      <p class="text-sm opacity-75">Waiting for the host to start the game...</p>
    {/if}
  </div>

  <!-- Connection Status -->
  <div class="flex items-center justify-center gap-2 mb-4 text-xs opacity-75">
    <div class={`w-2 h-2 rounded-full ${gameStore.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
    <span>{gameStore.connected ? 'Connected' : 'Disconnected'}</span>
  </div>
</div>
