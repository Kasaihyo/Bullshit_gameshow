<script>
	import { onMount } from 'svelte';

	let message = 'Welcome to Bullsh*t - Party Game';

	onMount(() => {
		console.log('App loaded');
	});
</script>

<div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-pink-900">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-white mb-4">{message}</h1>
		<p class="text-xl text-gray-200 mb-8">Coming soon...</p>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
			sans-serif;
	}
</style>
