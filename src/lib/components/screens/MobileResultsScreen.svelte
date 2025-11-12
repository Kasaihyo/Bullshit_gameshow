<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';
</script>

<div class="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-4">
  <!-- Header -->
  <div class="text-center mb-4">
    <h2 class="text-2xl font-bold mb-2">Results</h2>
    <p class="text-sm opacity-75">{gameStore.hotSeatPlayer?.name}'s Answer</p>
  </div>

  <!-- Verdict -->
  <div class="text-center mb-6">
    {#if gameStore.isAnswerCorrect}
      <p class="text-5xl mb-2">✓</p>
      <p class="text-xl font-bold text-green-400">CORRECT!</p>
      <p class="text-sm opacity-75">They were telling the truth</p>
    {:else}
      <p class="text-5xl mb-2">✕</p>
      <p class="text-xl font-bold text-red-400">BULLSHIT!</p>
      <p class="text-sm opacity-75">They were lying</p>
    {/if}
  </div>

  <!-- Correct Answer -->
  {#if gameStore.currentQuestion}
    <div class="bg-blue-600 rounded-lg p-4 mb-6 text-center flex-shrink-0">
      <p class="text-xs opacity-75 mb-2">THE CORRECT ANSWER WAS</p>
      <p class="text-lg font-bold">
        {gameStore.currentQuestion.options[gameStore.currentQuestion.correct || 0]}
      </p>
    </div>
  {/if}

  <!-- Player Status -->
  <div class="flex-1 flex flex-col gap-2 overflow-y-auto">
    <p class="text-sm opacity-75 text-center mb-2">Round Results</p>
    {#each gameStore.players as player (player.id)}
      {@const isAdvanced = gameStore.advanced?.includes(player.id)}
      {@const isEliminated = gameStore.eliminated?.includes(player.id)}
      <div
        class={`rounded-lg px-4 py-3 flex items-center justify-between text-sm $
          isEliminated
            ? 'bg-red-500/20 line-through opacity-60'
            : isAdvanced
              ? 'bg-green-500/20'
              : 'bg-white/10'
        }`}
      >
        <span class="font-semibold truncate">{player.name}</span>
        <span class="text-xs whitespace-nowrap ml-2">
          {#if isEliminated}
            ✕ Out
          {:else if isAdvanced}
            ✓ Advanced
          {:else}
            In Game
          {/if}
        </span>
      </div>
    {/each}
  </div>

  <!-- Next Text -->
  <div class="text-center text-xs opacity-75 mt-4 flex-shrink-0">
    <p>Next round starting soon...</p>
  </div>
</div>
