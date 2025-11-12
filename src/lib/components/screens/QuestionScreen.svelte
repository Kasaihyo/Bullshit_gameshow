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
</script>

<div class="max-w-4xl mx-auto py-12">
  <!-- Category & Difficulty -->
  <div class="flex gap-4 mb-8 justify-center">
    {#if gameStore.currentQuestion}
      <div class="bg-blue-500/30 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
        {gameStore.currentQuestion.category}
      </div>
      <div class="bg-yellow-500/30 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
        Difficulty: {gameStore.currentQuestion.difficulty}/5
      </div>
    {/if}
  </div>

  <!-- Hot Seat Player -->
  <div class="text-center mb-8">
    {#if gameStore.hotSeatPlayer}
      <p class="text-sm opacity-75 mb-2">HOT SEAT</p>
      <h2 class="text-3xl font-bold">{gameStore.hotSeatPlayer.name}</h2>
    {/if}
  </div>

  <!-- Question -->
  <div class="bg-white/10 backdrop-blur rounded-lg p-8 mb-12 text-center">
    <h1 class="text-4xl font-bold">{gameStore.currentQuestion?.question}</h1>
  </div>

  <!-- Options Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {#each gameStore.currentQuestion?.options || [] as option, index (index)}
      <button
        onclick={() => handleAnswerClick(index)}
        disabled={!gameStore.isHotSeat || selectedAnswer !== null}
        class="relative group overflow-hidden rounded-lg"
      >
        <!-- Background gradient -->
        <div
          class={`absolute inset-0 transition-all duration-300 ${
            selectedAnswer === index
              ? 'bg-green-500'
              : 'bg-gradient-to-br from-purple-600 to-pink-600 group-hover:from-purple-500 group-hover:to-pink-500'
          }`}
        ></div>

        <!-- Content -->
        <div class="relative px-8 py-6 text-left">
          <div class="text-sm font-semibold opacity-75 mb-2">
            {String.fromCharCode(65 + index)}
          </div>
          <div class="text-xl font-bold">{option}</div>
        </div>

        <!-- Border -->
        <div
          class={`absolute inset-0 border-2 rounded-lg transition-all ${
            selectedAnswer === index ? 'border-white' : 'border-white/20'
          }`}
        ></div>
      </button>
    {/each}
  </div>

  <!-- Helper Text -->
  {#if gameStore.isHotSeat}
    {#if selectedAnswer === null}
      <p class="text-center mt-8 text-lg opacity-75">Click an answer to lock it in</p>
    {:else}
      <p class="text-center mt-8 text-lg text-green-400">✓ Answer locked!</p>
    {/if}
  {:else}
    <p class="text-center mt-8 text-lg opacity-75">Waiting for {gameStore.hotSeatPlayer?.name} to answer...</p>
  {/if}
</div>
