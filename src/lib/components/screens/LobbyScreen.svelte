<script lang="ts">
  import { startGame } from '$lib/socket/client';
  import { gameStore } from '$lib/stores/game.svelte';
  import QRCode from '$lib/components/QRCode.svelte';

  export let roomCode: string;
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
  <!-- Left: QR Code -->
  <div class="flex flex-col items-center justify-center">
    <div class="bg-white p-4 rounded-lg mb-4">
      <QRCode url={`${window.location.origin}/join?code=${roomCode}`} />
    </div>
    <p class="text-sm opacity-75">Scan to join</p>
  </div>

  <!-- Center: Room Info -->
  <div class="flex flex-col items-center justify-center">
    <div class="text-center">
      <h1 class="text-5xl font-bold font-mono tracking-widest mb-4">{roomCode}</h1>
      <p class="text-lg opacity-75 mb-8">Share this code with friends</p>

      {#if gameStore.isHost}
        <button
          onclick={() => startGame()}
          disabled={gameStore.playerCount < 2}
          class="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all disabled:cursor-not-allowed"
        >
          {gameStore.playerCount < 2 ? `Need ${2 - gameStore.playerCount} more players` : 'START GAME'}
        </button>
      {:else}
        <div class="text-lg opacity-75">Waiting for host to start...</div>
      {/if}
    </div>
  </div>

  <!-- Right: Players -->
  <div class="flex flex-col">
    <h2 class="text-2xl font-bold mb-4">Players ({gameStore.playerCount})</h2>
    <div class="space-y-2 flex-1">
      {#each gameStore.players as player (player.id)}
        <div class="bg-white/10 backdrop-blur px-4 py-3 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
            <span class="font-semibold">{player.name}</span>
          </div>
          {#if player.role === 'host'}
            <span class="text-xs bg-purple-500 px-2 py-1 rounded">HOST</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
