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
</script>

<div class="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-4">
  <!-- Header -->
  <div class="text-center mb-4">
    <p class="text-sm opacity-75 mb-2">VOTING TIME</p>
    <h2 class="text-xl font-bold">{gameStore.hotSeatPlayer?.name}'s Answer</h2>
  </div>

  <!-- Answer Display -->
  {#if gameStore.currentQuestion && gameStore.hotSeatAnswer !== undefined}
    <div class="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-4 mb-4 border-2 border-white/20 text-center flex-shrink-0">
      <p class="text-xs opacity-75 mb-2">THEY SAID</p>
      <p class="text-2xl font-bold">
        {gameStore.currentQuestion.options[gameStore.hotSeatAnswer]}
      </p>
    </div>
  {/if}

  <!-- Status -->
  <div class="text-center mb-4 text-sm opacity-75">
    {#if gameStore.isJudge}
      <p>What's your verdict?</p>
    {:else}
      <p>You're not judging this round</p>
    {/if}
  </div>

  <!-- Vote Buttons -->
  {#if gameStore.isJudge}
    <div class="flex-1 flex gap-3 mb-4">
      <!-- BELIEVE Button -->
      <button
        onclick={() => handleVote('believe')}
        disabled={myVote !== null}
        class={`flex-1 rounded-lg font-bold py-6 px-4 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 $
          myVote === 'believe'
            ? 'bg-green-500 text-white scale-95'
            : 'bg-green-600 active:scale-95'
        }`}
      >
        <div class="text-2xl">✓</div>
        <div class="text-sm">BELIEVE</div>
      </button>

      <!-- BULLSHIT Button -->
      <button
        onclick={() => handleVote('bullshit')}
        disabled={myVote !== null}
        class={`flex-1 rounded-lg font-bold py-6 px-4 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 $
          myVote === 'bullshit'
            ? 'bg-red-500 text-white scale-95'
            : 'bg-red-600 active:scale-95'
        }`}
      >
        <div class="text-2xl">✕</div>
        <div class="text-sm">BULLSHIT</div>
      </button>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <p class="text-sm opacity-75">
        Waiting for others to vote...
      </p>
    </div>
  {/if}

  <!-- Voted Status -->
  {#if myVote}
    <div class="text-center text-xs text-green-400">
      ✓ Vote submitted!
    </div>
  {/if}
</div>
