<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';

  function getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
</script>

<div class="max-w-4xl mx-auto py-12">
  <!-- Header with Timer -->
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-bold opacity-75">Story Time</h2>
    <div class="text-right">
      <div class="text-sm opacity-75 mb-1">Time Remaining</div>
      <div class="text-4xl font-bold font-mono">
        {gameStore.timer || 0}s
      </div>
    </div>
  </div>

  <!-- Hot Seat Player -->
  <div class="text-center mb-8">
    <p class="text-sm opacity-75 mb-2">HOT SEAT</p>
    <h2 class="text-3xl font-bold">{gameStore.hotSeatPlayer?.name}</h2>
  </div>

  <!-- Question -->
  <div class="bg-white/10 backdrop-blur rounded-lg p-8 mb-8 text-center">
    <p class="text-sm opacity-75 mb-3">Question</p>
    <h1 class="text-3xl font-bold">{gameStore.currentQuestion?.question}</h1>
  </div>

  <!-- Selected Answer Display -->
  {#if gameStore.hotSeatAnswer !== undefined && gameStore.currentQuestion}
    <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-8 mb-12 text-center border-2 border-white/20">
      <p class="text-sm opacity-75 mb-3 uppercase tracking-wide">Their Answer</p>
      <p class="text-lg opacity-75 mb-2">
        {getAnswerLetter(gameStore.hotSeatAnswer)}
      </p>
      <p class="text-2xl font-bold">
        {gameStore.currentQuestion.options[gameStore.hotSeatAnswer]}
      </p>
    </div>
  {/if}

  <!-- Story Content -->
  <div class="bg-white/5 backdrop-blur rounded-lg p-12 text-center">
    {#if gameStore.myPlayerId === gameStore.hotSeatPlayer?.id}
      <!-- Hot Seat Player View -->
      <div class="space-y-6">
        <p class="text-sm opacity-75 uppercase tracking-wide">Your Turn to Explain</p>
        <p class="text-2xl font-semibold leading-relaxed opacity-90">
          Tell your story. Is it the truth, or are you bullsh*tting?
        </p>
        <p class="text-sm opacity-50 italic mt-8">
          You have {gameStore.timer || 0} seconds to convince everyone
        </p>
      </div>
    {:else}
      <!-- Judge View -->
      <div class="space-y-6">
        <p class="text-2xl font-semibold opacity-75">Listen Carefully</p>
        <p class="text-lg opacity-60">
          Is {gameStore.hotSeatPlayer?.name} telling the truth or bullsh*tting?
        </p>
        <p class="text-sm opacity-40 mt-8">
          You'll vote in {gameStore.timer || 0} seconds...
        </p>
      </div>
    {/if}
  </div>
</div>
