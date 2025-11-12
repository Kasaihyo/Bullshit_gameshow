<script lang="ts">
  import { gameStore } from '$lib/stores/game.svelte';
  import { submitVote } from '$lib/socket/client';

  let myVote = $state<'believe' | 'bullshit' | null>(null);

  function handleVote(vote: 'believe' | 'bullshit') {
    if (!gameStore.isJudge || myVote !== null) {
      return;
    }
    myVote = vote;
    submitVote(vote);
  }

  function getAnswerLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
</script>

<div class="max-w-4xl mx-auto py-12 flex flex-col h-screen">
  <!-- Header with Timer -->
  <div class="flex justify-between items-center mb-8">
    <h2 class="text-2xl font-bold opacity-75">Time to Vote</h2>
    <div class="text-right">
      <div class="text-sm opacity-75 mb-1">Vote Closes In</div>
      <div class="text-4xl font-bold font-mono">
        {gameStore.timer || 0}s
      </div>
    </div>
  </div>

  <!-- Question & Answer Summary -->
  <div class="bg-white/10 backdrop-blur rounded-lg p-8 mb-8 text-center">
    <p class="text-sm opacity-75 mb-3">{gameStore.hotSeatPlayer?.name} said...</p>
    <h1 class="text-2xl font-bold mb-6">{gameStore.currentQuestion?.question}</h1>
    {#if gameStore.hotSeatAnswer !== undefined && gameStore.currentQuestion}
      <div class="inline-block bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg px-6 py-3">
        <p class="text-sm opacity-75 mb-2">{getAnswerLetter(gameStore.hotSeatAnswer)}</p>
        <p class="text-lg font-bold">
          {gameStore.currentQuestion.options[gameStore.hotSeatAnswer]}
        </p>
      </div>
    {/if}
  </div>

  <!-- Vote Buttons -->
  <div class="flex-1 flex gap-4 mb-12">
    <!-- BELIEVE Button -->
    <button
      onclick={() => handleVote('believe')}
      disabled={!gameStore.isJudge || myVote !== null}
      class={`flex-1 rounded-lg font-bold text-xl py-8 px-6 transition-all disabled:cursor-not-allowed $
        myVote === 'believe'
          ? 'bg-green-500 text-white scale-105 shadow-lg shadow-green-500/50'
          : 'bg-green-600 hover:bg-green-500 hover:scale-105 disabled:bg-green-900/30 disabled:scale-100 text-white'
      }`}
    >
      <div class="text-3xl mb-2">✓</div>
      BELIEVE
    </button>

    <!-- BULLSHIT Button -->
    <button
      onclick={() => handleVote('bullshit')}
      disabled={!gameStore.isJudge || myVote !== null}
      class={`flex-1 rounded-lg font-bold text-xl py-8 px-6 transition-all disabled:cursor-not-allowed $
        myVote === 'bullshit'
          ? 'bg-red-500 text-white scale-105 shadow-lg shadow-red-500/50'
          : 'bg-red-600 hover:bg-red-500 hover:scale-105 disabled:bg-red-900/30 disabled:scale-100 text-white'
      }`}
    >
      <div class="text-3xl mb-2">✕</div>
      BULLSHIT
    </button>
  </div>

  <!-- Status Messages -->
  <div class="text-center">
    {#if !gameStore.isJudge}
      <p class="text-lg opacity-75">
        You're not judging this round. Wait for the results...
      </p>
    {:else if myVote === null}
      <p class="text-lg opacity-75">
        What's your verdict?
      </p>
    {:else}
      <p class="text-lg text-green-400">
        ✓ Vote submitted!
      </p>
    {/if}
  </div>
</div>
