<script lang="ts">
  import { onMount } from 'svelte';
  import QRCodeLib from 'qrcode';

  export let url: string;
  export let size: number = 200;

  let canvas: HTMLCanvasElement;

  onMount(async () => {
    if (canvas) {
      try {
        await QRCodeLib.toCanvas(canvas, url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }
  });
</script>

<canvas bind:this={canvas} width={size} height={size}></canvas>
