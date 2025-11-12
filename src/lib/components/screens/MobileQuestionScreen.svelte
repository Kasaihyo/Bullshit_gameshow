<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';
  import { lockAnswer } from '$lib/socket/client';

  let selectedAnswer = $state<number | null>(null);

  function handleAnswerClick(index: number) {
    if (gameStore.isHotSeat && selectedAnswer === null) {
      selectedAnswer = index;
      lockAnswer(index);
    }
  }

  function getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
</script>

<div class="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-4">
  <!-- Header -->
  <div class="text-center mb-4">
    {#if gameStore.isHotSeat}
      <p class="text-sm opacity-75 mb-1">YOU'RE UP!</p>
      <h2 class="text-xl font-bold">Pick Your Answer</h2>
    {:else}
      <p class="text-sm opacity-75 mb-1">WATCHING</p>
      <h2 class="text-lg font-bold">{gameStore.hotSeatPlayer?.name}'s Turn</h2>
    {/if}
  </div>

  <!-- Category & Difficulty -->
  <div class="flex gap-2 mb-4 justify-center">
    {#if gameStore.currentQuestion}
      <div class="bg-blue-500/30 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
        {gameStore.currentQuestion.category}
      </div>
      <div class="bg-yellow-500/30 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
        {gameStore.currentQuestion.difficulty}/5
      </div>
    {/if}
  </div>

  <!-- Question -->
  <div class="bg-white/10 backdrop-blur rounded-lg p-4 mb-4 flex-shrink-0">
    <p class="text-center font-semibold leading-tight">
      {gameStore.currentQuestion?.question}
    </p>
  </div>

  <!-- Options -->
  <div class="flex-1 flex flex-col gap-3 overflow-y-auto">
    {#each gameStore.currentQuestion?.options || [] as option, index (index)}
      <button
        onclick={() => handleAnswerClick(index)}
        disabled={!gameStore.isHotSeat || selectedAnswer !== null}
        class="relative group overflow-hidden rounded-lg flex-1 min-h-16"
      >
        <!-- Background -->
        <div
          class={`absolute inset-0 transition-all $
            selectedAnswer === index
              ? 'bg-green-500'
              : 'bg-gradient-to-br from-purple-600 to-pink-600 group-active:from-purple-500 group-active:to-pink-500'
          }`}
        ></div>

        <!-- Content -->
        <div class="relative h-full flex flex-col items-center justify-center px-3 py-2">
          <div class="text-sm font-semibold opacity-75 mb-1">
            {getAnswerLetter(index)}
          </div>
          <div class="text-sm font-bold text-center line-clamp-2">{option}</div>
        </div>

        <!-- Border -->
        <div
          class={`absolute inset-0 border-2 rounded-lg transition-all $
            selectedAnswer === index ? 'border-white' : 'border-white/20'
          }`}
        ></div>
      </button>
    {/each}
  </div>

  <!-- Status -->
  <div class="text-center mt-4 text-xs opacity-75">
    {#if gameStore.isHotSeat}
      {#if selectedAnswer === null}
        <p>Tap an answer to lock it in</p>
      {:else}
        <p class="text-green-400">✓ Locked in</p>
      {/if}
    {:else}
      <p>Waiting for {gameStore.hotSeatPlayer?.name}...</p>
    {/if}
  </div>
</div>
