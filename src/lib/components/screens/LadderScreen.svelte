<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';
  import { startGame } from '$lib/socket/client';

  function getMedalIcon(position: number): string {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '•';
    }
  }
</script>

<div class="max-w-4xl mx-auto py-12">
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-5xl font-bold mb-4">Game Over!</h1>
    <p class="text-2xl opacity-75">Final Standings</p>
  </div>

  <!-- Winner Podium -->
  <div class="mb-16">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      <!-- 1st Place -->
      {#if gameStore.ladder && gameStore.ladder.length >= 1}
        <div class="order-2 md:order-1">
          <div class="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-8 text-center border-4 border-yellow-400 transform md:scale-90">
            <p class="text-sm opacity-75 mb-2">2nd Place</p>
            <p class="text-4xl mb-4">
              {#if gameStore.ladder[1]}
                🥈
              {/if}
            </p>
            <p class="text-2xl font-bold mb-2">
              {gameStore.ladder[1]?.playerName || '-'}
            </p>
            <p class="text-3xl font-bold text-yellow-200">
              {gameStore.ladder[1]?.score || 0} pts
            </p>
          </div>
        </div>
      {/if}

      <!-- 1st Place (Center) -->
      {#if gameStore.ladder && gameStore.ladder.length >= 1}
        <div class="order-1 md:order-2">
          <div class="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-8 text-center border-4 border-yellow-300 transform scale-110">
            <p class="text-sm opacity-75 mb-2">1st Place</p>
            <p class="text-6xl mb-4">🏆</p>
            <p class="text-3xl font-bold mb-2">
              {gameStore.ladder[0]?.playerName || '-'}
            </p>
            <p class="text-4xl font-bold text-yellow-700">
              {gameStore.ladder[0]?.score || 0} pts
            </p>
          </div>
        </div>
      {/if}

      <!-- 3rd Place -->
      {#if gameStore.ladder && gameStore.ladder.length >= 3}
        <div class="order-3 md:order-3">
          <div class="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-8 text-center border-4 border-orange-400 transform md:scale-90">
            <p class="text-sm opacity-75 mb-2">3rd Place</p>
            <p class="text-4xl mb-4">🥉</p>
            <p class="text-2xl font-bold mb-2">
              {gameStore.ladder[2]?.playerName || '-'}
            </p>
            <p class="text-3xl font-bold text-orange-200">
              {gameStore.ladder[2]?.score || 0} pts
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Full Ladder Rankings -->
  <div class="bg-white/10 backdrop-blur rounded-lg p-8 mb-12">
    <h2 class="text-2xl font-bold mb-6">Full Rankings</h2>
    <div class="space-y-3">
      {#if gameStore.ladder && gameStore.ladder.length > 0}
        {#each gameStore.ladder as entry, index (entry.playerId)}
          <div class="flex items-center justify-between bg-white/5 rounded-lg px-6 py-4 hover:bg-white/10 transition-colors">
            <div class="flex items-center gap-4">
              <span class="text-3xl">{getMedalIcon(index + 1)}</span>
              <div>
                <p class="text-xl font-bold">#{index + 1}</p>
              </div>
              <p class="text-lg font-semibold">{entry.playerName}</p>
            </div>
            <p class="text-2xl font-bold text-purple-300">
              {entry.score || 0} <span class="text-sm opacity-75">pts</span>
            </p>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Action Buttons -->
  {#if gameStore.isHost}
    <div class="flex gap-4 justify-center">
      <button
        onclick={() => startGame()}
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all hover:scale-105"
      >
        Play Again
      </button>
      <button
        onclick={() => {
          window.location.href = '/host';
        }}
        class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all hover:scale-105"
      >
        New Game
      </button>
    </div>
  {:else}
    <div class="text-center">
      <p class="text-lg opacity-75 mb-6">Waiting for host to start a new game...</p>
      <button
        onclick={() => {
          window.location.href = '/host';
        }}
        class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all"
      >
        Create New Game
      </button>
    </div>
  {/if}
</div>
