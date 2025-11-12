<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';

  function getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  function isPlayerAdvanced(playerId: string | undefined): boolean {
    if (!playerId) return false;
    return gameStore.advanced?.includes(playerId) || false;
  }

  function isPlayerEliminated(playerId: string | undefined): boolean {
    if (!playerId) return false;
    return gameStore.eliminated?.includes(playerId) || false;
  }
</script>

<div class="max-w-4xl mx-auto py-12">
  <!-- Header -->
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold mb-2">Answer Revealed</h1>
    <p class="text-xl opacity-75">{gameStore.hotSeatPlayer?.name}'s Answer</p>
  </div>

  <!-- Hot Seat Player's Answer -->
  <div class="mb-12">
    <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-8 text-center border-2 border-white/20 mb-4">
      <p class="text-sm opacity-75 mb-3">THEIR ANSWER</p>
      <p class="text-lg opacity-75 mb-2">
        {getAnswerLetter(gameStore.hotSeatAnswer || 0)}
      </p>
      <p class="text-2xl font-bold">
        {gameStore.currentQuestion?.options[gameStore.hotSeatAnswer || 0]}
      </p>
    </div>
  </div>

  <!-- Verdict -->
  <div class="text-center mb-12">
    {#if gameStore.isAnswerCorrect}
      <div class="inline-block bg-green-500/20 border-2 border-green-400 rounded-lg px-8 py-6">
        <p class="text-5xl mb-4">✓</p>
        <p class="text-3xl font-bold text-green-400">CORRECT!</p>
        <p class="text-lg opacity-75 mt-4">They were telling the truth</p>
      </div>
    {:else}
      <div class="inline-block bg-red-500/20 border-2 border-red-400 rounded-lg px-8 py-6">
        <p class="text-5xl mb-4">✕</p>
        <p class="text-3xl font-bold text-red-400">BULLSHIT!</p>
        <p class="text-lg opacity-75 mt-4">They were lying!</p>
      </div>
    {/if}
  </div>

  <!-- Correct Answer Display -->
  {#if gameStore.currentQuestion}
    <div class="bg-white/10 backdrop-blur rounded-lg p-8 mb-12 text-center">
      <p class="text-sm opacity-75 mb-4">THE CORRECT ANSWER IS</p>
      <div class="inline-block bg-blue-600 rounded-lg px-6 py-3">
        <p class="text-sm opacity-75 mb-2">
          {getAnswerLetter(gameStore.currentQuestion.correct || 0)}
        </p>
        <p class="text-xl font-bold">
          {gameStore.currentQuestion.options[gameStore.currentQuestion.correct || 0]}
        </p>
      </div>
      {#if gameStore.currentQuestion.explanation}
        <p class="text-sm opacity-60 mt-6 italic max-w-2xl">
          {gameStore.currentQuestion.explanation}
        </p>
      {/if}
    </div>
  {/if}

  <!-- Results Grid -->
  <div class="grid grid-cols-2 gap-8 mb-12">
    <!-- Advanced Players -->
    <div class="bg-green-500/10 border-2 border-green-500/30 rounded-lg p-6">
      <h3 class="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
        <span class="text-2xl">✓</span>
        Advanced
      </h3>
      <div class="space-y-2">
        {#if gameStore.advanced && gameStore.advanced.length > 0}
          {#each gameStore.players.filter(p => gameStore.advanced?.includes(p.id)) as player (player.id)}
            <div class="bg-green-500/20 rounded px-4 py-2 font-semibold">
              {player.name}
            </div>
          {/each}
        {:else}
          <p class="text-sm opacity-50">No one advanced this round</p>
        {/if}
      </div>
    </div>

    <!-- Eliminated Players -->
    <div class="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6">
      <h3 class="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
        <span class="text-2xl">✕</span>
        Eliminated
      </h3>
      <div class="space-y-2">
        {#if gameStore.eliminated && gameStore.eliminated.length > 0}
          {#each gameStore.players.filter(p => gameStore.eliminated?.includes(p.id)) as player (player.id)}
            <div class="bg-red-500/20 rounded px-4 py-2 font-semibold line-through opacity-60">
              {player.name}
            </div>
          {/each}
        {:else}
          <p class="text-sm opacity-50">No one was eliminated</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- All Players Status -->
  <div class="bg-white/10 backdrop-blur rounded-lg p-8 text-center">
    <h3 class="text-lg font-bold mb-6 opacity-75">CURRENT STANDINGS</h3>
    <div class="space-y-2">
      {#each gameStore.players as player (player.id)}
        <div
          class={`flex items-center justify-between px-4 py-3 rounded-lg backdrop-blur $
            isPlayerEliminated(player.id)
              ? 'bg-red-500/20 line-through opacity-50'
              : 'bg-white/10'
          }`}
        >
          <span class="font-semibold">{player.name}</span>
          {#if isPlayerEliminated(player.id)}
            <span class="text-red-400">Eliminated</span>
          {:else if isPlayerAdvanced(player.id)}
            <span class="text-green-400">✓ Advanced</span>
          {:else if player.id === gameStore.hotSeatPlayer?.id}
            <span class="text-purple-400">Hot Seat</span>
          {:else}
            <span class="opacity-75">In Game</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
